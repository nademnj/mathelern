import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Section } from "@/lib/content/schema";

// In-memory content store.
const sections: Record<string, Section> = {};
vi.mock("@/lib/content/store", async () => {
  const { mergeLesson, mergeQuiz } = await import("@/lib/content/merge");
  return {
    getSection: async (id: string) => sections[id] ?? null,
    saveLesson: async (id: string, lesson: Section["lessons"][number]) => {
      sections[id] = { ...sections[id], lessons: mergeLesson(sections[id].lessons, lesson) };
      return sections[id];
    },
    saveQuizQuestions: async (id: string, qs: Section["quiz"]) => {
      sections[id] = { ...sections[id], quiz: mergeQuiz(sections[id].quiz, qs) };
      return sections[id];
    },
  };
});

// Scripted model turns.
const turns: unknown[] = [];
const requests: { messages: unknown[] }[] = [];
vi.mock("@/lib/claude", () => ({
  MODEL: "test-model",
  FALLBACK_BETA: "server-side-fallback-2026-07-01",
  getClient: () => ({
    beta: {
      messages: {
        stream: (params: { messages: unknown[] }) => {
          requests.push({ messages: structuredClone(params.messages) });
          const next = turns.shift();
          return { finalMessage: async () => next };
        },
      },
    },
  }),
}));

const { collectSection } = await import("@/lib/agent/collector");

const lessonInput = {
  id: "Fuchs Biologie",
  titleDe: "Fuchs",
  titleEn: "Fox",
  paragraphs: [
    { de: "Der Fuchs ist ein Raubwild.", en: "The fox is a predator.", quote: false },
    { de: "Die Ranzzeit ist im Winter.", en: "The mating season is in winter.", quote: false },
  ],
  keyTerms: [{ de: "Ranz", en: "fox mating season", note: "" }],
  sources: [{ title: "DJV", url: "https://www.jagdverband.de/" }, { title: "bad", url: "javascript:alert(1)" }],
};

beforeEach(() => {
  turns.length = 0;
  requests.length = 0;
  sections.wild = {
    id: "wild", order: 1, titleDe: "Wild", titleEn: "Game", summaryDe: "s", summaryEn: "s", researchTopics: [], lessons: [], quiz: [],
  };
});

describe("collectSection", () => {
  it("resumes paused turns, saves lessons and quiz questions, and reports progress", async () => {
    turns.push(
      {
        stop_reason: "pause_turn",
        content: [{ type: "server_tool_use", id: "s1", name: "web_search", input: { query: "Fuchs Biologie" } }],
      },
      {
        stop_reason: "tool_use",
        content: [
          { type: "server_tool_use", id: "s2", name: "web_fetch", input: { url: "https://www.jagdverband.de/" } },
          { type: "tool_use", id: "t1", name: "save_lesson", input: lessonInput },
        ],
      },
      {
        stop_reason: "tool_use",
        content: [
          {
            type: "tool_use",
            id: "t2",
            name: "save_quiz_questions",
            input: {
              questions: [
                {
                  id: "fuchs-ranz", lessonId: "fuchs-biologie", questionDe: "Wann ranzt der Fuchs?", questionEn: "When does the fox mate?",
                  options: [{ de: "Winter", en: "Winter" }, { de: "Sommer", en: "Summer" }, { de: "Herbst", en: "Autumn" }],
                  correct: [0, 0], explanationDe: "Im Winter.", explanationEn: "In winter.",
                },
                {
                  id: "kaputt", lessonId: "x", questionDe: "Q", questionEn: "Q",
                  options: [{ de: "a", en: "a" }, { de: "b", en: "b" }, { de: "c", en: "c" }],
                  correct: [7], explanationDe: "e", explanationEn: "e",
                },
              ],
            },
          },
        ],
      },
      { stop_reason: "end_turn", content: [{ type: "text", text: "Saved one lesson." }] }
    );

    const events: { type: string }[] = [];
    await collectSection({ sectionId: "wild", state: "Bayern", onEvent: (e) => events.push(e) });

    const s = sections.wild;
    expect(s.lessons).toHaveLength(1);
    expect(s.lessons[0].id).toBe("fuchs-biologie");
    expect(s.lessons[0].origin).toBe("agent");
    expect(s.lessons[0].sources.map((x) => x.url)).toEqual(["https://www.jagdverband.de/"]);
    expect(s.quiz.map((q) => q.id)).toEqual(["fuchs-ranz"]);
    expect(s.quiz[0].correct).toEqual([0]);
    expect(s.quiz[0].lessonId).toBe("fuchs-biologie");

    expect(events.map((e) => e.type)).toEqual(
      expect.arrayContaining(["search", "fetch", "lesson_saved", "quiz_saved", "done"])
    );
    // The paused turn was sent back as an assistant message, with no extra user message.
    const second = requests[1].messages as { role: string }[];
    expect(second.map((m) => m.role)).toEqual(["user", "assistant"]);
    // Tool results went back in one user message, with the bad question reported.
    const fourth = requests[3].messages as { role: string; content: { content: string }[] }[];
    expect(fourth.at(-1)!.content[0].content).toMatch(/Rejected: kaputt/);
  });

  it("does not save a tool call that was cut off at max_tokens", async () => {
    turns.push({ stop_reason: "max_tokens", content: [{ type: "tool_use", id: "t1", name: "save_lesson", input: { id: "x" } }] });
    const events: { type: string }[] = [];
    await collectSection({ sectionId: "wild", state: "Bayern", onEvent: (e) => events.push(e) });
    expect(sections.wild.lessons).toHaveLength(0);
    expect(events.some((e) => e.type === "warning")).toBe(true);
  });
});
