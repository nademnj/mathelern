import { describe, expect, it } from "vitest";
import { isAnswerCorrect, practiceOrder, shuffle } from "@/lib/quiz";
import { mergeLesson, mergeQuiz } from "@/lib/content/merge";
import type { Lesson, QuizQuestion } from "@/lib/content/schema";

describe("isAnswerCorrect", () => {
  it("needs exactly the correct set", () => {
    const q = { correct: [0, 2] };
    expect(isAnswerCorrect(q, [2, 0])).toBe(true);
    expect(isAnswerCorrect(q, [0])).toBe(false);
    expect(isAnswerCorrect(q, [0, 1, 2])).toBe(false);
    expect(isAnswerCorrect(q, [])).toBe(false);
  });
});

describe("shuffle / practiceOrder", () => {
  it("is deterministic and keeps all items", () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(shuffle(items, 42)).toEqual(shuffle(items, 42));
    expect([...shuffle(items, 7)].sort()).toEqual(items);
  });
  it("puts unseen first, then wrong, then right", () => {
    const items = [{ key: "right" }, { key: "wrong" }, { key: "new" }];
    const answers = { right: { lastCorrect: true }, wrong: { lastCorrect: false } };
    expect(practiceOrder(items, answers, 3).map((i) => i.key)).toEqual(["new", "wrong", "right"]);
  });
});

const lesson = (id: string, title: string): Lesson => ({
  id, titleDe: title, titleEn: title, paragraphs: [{ de: "a", en: "a" }], keyTerms: [], sources: [], origin: "agent", updatedAt: "x",
});
const question = (id: string, text: string): QuizQuestion => ({
  id, questionDe: text, questionEn: text, options: [{ de: "a", en: "a" }, { de: "b", en: "b" }], correct: [0],
  explanationDe: "e", explanationEn: "e", origin: "agent",
});

describe("merge", () => {
  it("replaces a lesson with the same id in place", () => {
    const out = mergeLesson([lesson("a", "A"), lesson("b", "B")], lesson("a", "A2"));
    expect(out.map((l) => l.titleDe)).toEqual(["A2", "B"]);
  });
  it("skips questions with duplicate German text", () => {
    const out = mergeQuiz([question("q1", "Was ist  Schalenwild?")], [question("q2", "was ist schalenwild?"), question("q3", "Neu")]);
    expect(out.map((q) => q.id)).toEqual(["q1", "q3"]);
  });
});
