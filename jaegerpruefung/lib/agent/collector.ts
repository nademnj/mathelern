import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FALLBACK_BETA, MODEL, getClient } from "@/lib/claude";
import { getSection, saveLesson, saveQuizQuestions } from "@/lib/content/store";
import { lessonSchema, quizQuestionSchema, type Lesson, type QuizQuestion } from "@/lib/content/schema";

/** Progress events streamed to the CLI / the /agent page. */
export type CollectorEvent =
  | { type: "status"; message: string }
  | { type: "search"; query: string }
  | { type: "fetch"; url: string }
  | { type: "thinking"; text: string }
  | { type: "lesson_saved"; lessonId: string; title: string }
  | { type: "quiz_saved"; count: number }
  | { type: "warning"; message: string }
  | { type: "done"; lessonsSaved: number; questionsSaved: number }
  | { type: "error"; message: string };

export interface CollectOptions {
  sectionId: string;
  /** Bundesland whose Landesjagdgesetz / exam rules to prefer, e.g. "Bayern". */
  state: string;
  /** Optional extra instruction, e.g. "Schalenwild: Rehwild und Schwarzwild". */
  focus?: string;
  /** How many lessons the agent should write in this run. */
  maxLessons?: number;
  onEvent: (event: CollectorEvent) => void;
  signal?: AbortSignal;
}

const MAX_ITERATIONS = 40;

// ---- Tool input schemas (what the model sends) -----------------------------

const saveLessonInput = z.object({
  id: z.string().min(3).max(60),
  titleDe: z.string().min(1),
  titleEn: z.string().min(1),
  paragraphs: z
    .array(z.object({ de: z.string().min(1), en: z.string().min(1), quote: z.boolean() }))
    .min(2),
  keyTerms: z.array(z.object({ de: z.string().min(1), en: z.string().min(1), note: z.string() })),
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().min(1) })).min(1),
});

const saveQuizInput = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(3).max(60),
        lessonId: z.string(),
        questionDe: z.string().min(1),
        questionEn: z.string().min(1),
        options: z.array(z.object({ de: z.string().min(1), en: z.string().min(1) })).min(3).max(5),
        correct: z.array(z.number().int().min(0)).min(1),
        explanationDe: z.string().min(1),
        explanationEn: z.string().min(1),
      })
    )
    .min(1),
});

const bilingual = {
  type: "object",
  additionalProperties: false,
  required: ["de", "en"],
  properties: { de: { type: "string" }, en: { type: "string" } },
} as const;

const tools: Anthropic.Beta.BetaToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 20 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 20, max_content_tokens: 30000 },
  {
    name: "save_lesson",
    description:
      "Save one finished study lesson (German original text + aligned English translation) into the current exam section. Call once per lesson, after you have researched it. Saving a lesson with an existing id replaces that lesson.",
    strict: true,
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["id", "titleDe", "titleEn", "paragraphs", "keyTerms", "sources"],
      properties: {
        id: { type: "string", description: "kebab-case slug, ASCII only, e.g. 'schalenwild-rehwild'" },
        titleDe: { type: "string" },
        titleEn: { type: "string" },
        paragraphs: {
          type: "array",
          description: "4-10 paragraphs. Each item is one German paragraph and its faithful English translation.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["de", "en", "quote"],
            properties: {
              de: { type: "string" },
              en: { type: "string" },
              quote: { type: "boolean", description: "true only if `de` is a verbatim quote of a statute or regulation" },
            },
          },
        },
        keyTerms: {
          type: "array",
          description: "5-12 German technical terms (Jägersprache / legal terms) that appear in the lesson.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["de", "en", "note"],
            properties: {
              de: { type: "string" },
              en: { type: "string" },
              note: { type: "string", description: "one-sentence English explanation" },
            },
          },
        },
        sources: {
          type: "array",
          description: "The web pages this lesson is based on (only pages you actually read).",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "url"],
            properties: { title: { type: "string" }, url: { type: "string" } },
          },
        },
      },
    },
  },
  {
    name: "save_quiz_questions",
    description:
      "Save multiple-choice exam questions for the current section, in the style of the German Jägerprüfung (one or more options can be correct).",
    strict: true,
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["questions"],
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "lessonId", "questionDe", "questionEn", "options", "correct", "explanationDe", "explanationEn"],
            properties: {
              id: { type: "string", description: "kebab-case slug, unique" },
              lessonId: { type: "string", description: "id of the lesson this question tests" },
              questionDe: { type: "string" },
              questionEn: { type: "string" },
              options: { type: "array", description: "3-5 answer options", items: bilingual },
              correct: { type: "array", description: "0-based indexes of ALL correct options", items: { type: "integer" } },
              explanationDe: { type: "string" },
              explanationEn: { type: "string" },
            },
          },
        },
      },
    },
  },
];

function buildSystemPrompt(state: string): string {
  return `You are a research agent that builds study material for a learner preparing for the German hunting licence exam (Jägerprüfung / "Grünes Abitur"), taking it in ${state}. The learner reads German slowly; they study the German original side by side with an English translation.

How to work:
- Research with web_search, then read the most useful pages with web_fetch. Prefer authoritative sources: federal and state law (gesetze-im-internet.de, the state's official law portal), ministries, the state hunting association (Landesjagdverband), DJV, Friedrich-Loeffler-Institut, BfR, universities, and official exam question catalogues where the state publishes one. Use hunting-school pages and forums only to cross-check.
- Where state law differs from the Bundesjagdgesetz, teach the ${state} rule and say that it is state-specific.
- Write each lesson as German study text a good hunting-school script would contain, then translate each paragraph faithfully into English. Keep German hunting terms (Jägersprache) in the English text in parentheses the first time, e.g. "the roe buck's antlers (Gehörn)".
- Copyright: statutes and official regulations are public domain in Germany (§ 5 UrhG); you may quote them verbatim and mark those paragraphs quote=true. Everything else must be your own wording based on what you read; never copy more than a single short sentence from a non-official source.
- Only state facts you found in a source or are certain about. Numbers (seasons, calibres, energy values, deadlines) must come from a source you read. If sources disagree, say so in the text.
- Every lesson must list the pages it is based on in sources.
- After saving the lessons, save 4-8 quiz questions per lesson with save_quiz_questions. Questions should test exam-relevant facts, have 3-5 options, and may have more than one correct option, like the real exam.
- Do not ask the user questions; there is nobody to answer. When you are done, reply with a two-sentence summary of what you saved.`;
}

function buildTask(sectionTitle: string, summary: string, topics: string[], existing: { id: string; titleDe: string }[], focus: string | undefined, maxLessons: number): string {
  const existingList = existing.length
    ? `Lessons that already exist in this section (do not duplicate them; you may improve one by saving with the same id only if the focus asks for it):\n${existing.map((l) => `- ${l.id}: ${l.titleDe}`).join("\n")}`
    : "This section has no lessons yet.";
  return `Exam section: ${sectionTitle}
What it covers: ${summary}
Suggested research topics: ${topics.join("; ") || "(none)"}
${existingList}
${focus ? `\nFocus for this run: ${focus}\n` : ""}
Research and save up to ${maxLessons} new lesson(s) for this section, then the quiz questions for them.`;
}

/** Runs the collector agent for one exam section. Returns when the agent finishes. */
export async function collectSection(opts: CollectOptions): Promise<void> {
  const { sectionId, state, focus, onEvent, signal } = opts;
  const maxLessons = Math.min(Math.max(opts.maxLessons ?? 2, 1), 6);

  const section = await getSection(sectionId);
  if (!section) throw new Error(`Unknown section "${sectionId}"`);

  const client = getClient();
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: buildTask(
        `${section.titleDe} (${section.titleEn})`,
        section.summaryEn,
        section.researchTopics,
        section.lessons.map((l) => ({ id: l.id, titleDe: l.titleDe })),
        focus,
        maxLessons
      ),
    },
  ];

  let lessonsSaved = 0;
  let questionsSaved = 0;
  const knownLessonIds = new Set(section.lessons.map((l) => l.id));

  onEvent({ type: "status", message: `Agent started on "${section.titleDe}" (${state}).` });

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    if (signal?.aborted) throw new Error("Aborted");

    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 64000,
        betas: [FALLBACK_BETA],
        fallbacks: "default",
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: "high" },
        system: buildSystemPrompt(state),
        tools,
        messages,
      },
      { signal }
    );
    const message = await stream.finalMessage();

    // Surface what the agent did this turn.
    for (const block of message.content) {
      if (block.type === "server_tool_use") {
        const input = block.input as { query?: string; url?: string };
        if (block.name === "web_search" && input.query) onEvent({ type: "search", query: input.query });
        if (block.name === "web_fetch" && input.url) onEvent({ type: "fetch", url: input.url });
      } else if (block.type === "thinking" && block.thinking) {
        onEvent({ type: "thinking", text: block.thinking.slice(0, 400) });
      } else if (block.type === "text" && block.text.trim()) {
        onEvent({ type: "status", message: block.text.trim() });
      }
    }

    if (message.stop_reason === "refusal") {
      onEvent({ type: "error", message: "The model declined this request." });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      // Long server-tool turn; send it back unchanged and the server resumes.
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) {
      if (message.stop_reason === "max_tokens") onEvent({ type: "warning", message: "Agent hit the output limit." });
      break;
    }
    if (message.stop_reason === "max_tokens") {
      // A tool call cut off mid-way would be a truncated lesson; don't save it.
      onEvent({ type: "warning", message: "Agent output was cut off; stopping this run." });
      break;
    }

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const call of toolUses) {
      try {
        const text = await runTool(call, sectionId, knownLessonIds, {
          onLesson: (l) => {
            lessonsSaved++;
            knownLessonIds.add(l.id);
            onEvent({ type: "lesson_saved", lessonId: l.id, title: l.titleDe });
          },
          onQuiz: (n) => {
            questionsSaved += n;
            onEvent({ type: "quiz_saved", count: n });
          },
        });
        results.push({ type: "tool_result", tool_use_id: call.id, content: text });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onEvent({ type: "warning", message: `${call.name} failed: ${msg}` });
        results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: msg });
      }
    }
    messages.push({ role: "user", content: results });
  }

  onEvent({ type: "done", lessonsSaved, questionsSaved });
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function runTool(
  call: Anthropic.Beta.BetaToolUseBlock,
  sectionId: string,
  knownLessonIds: Set<string>,
  cb: { onLesson: (l: Lesson) => void; onQuiz: (n: number) => void }
): Promise<string> {
  if (call.name === "save_lesson") {
    const parsed = saveLessonInput.safeParse(call.input);
    if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
    const input = parsed.data;
    const lesson: Lesson = lessonSchema.parse({
      ...input,
      id: slug(input.id),
      paragraphs: input.paragraphs.map((p) => (p.quote ? p : { de: p.de, en: p.en })),
      keyTerms: input.keyTerms.map((k) => (k.note ? k : { de: k.de, en: k.en })),
      sources: input.sources.filter((s) => /^https?:\/\//.test(s.url)),
      origin: "agent",
      updatedAt: new Date().toISOString(),
    });
    await saveLesson(sectionId, lesson);
    cb.onLesson(lesson);
    return `Saved lesson "${lesson.id}".`;
  }

  if (call.name === "save_quiz_questions") {
    const parsed = saveQuizInput.safeParse(call.input);
    if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
    const questions: QuizQuestion[] = [];
    const rejected: string[] = [];
    for (const q of parsed.data.questions) {
      const candidate = {
        ...q,
        id: slug(q.id),
        lessonId: knownLessonIds.has(slug(q.lessonId)) ? slug(q.lessonId) : undefined,
        correct: [...new Set(q.correct)],
        origin: "agent" as const,
      };
      const ok = quizQuestionSchema.safeParse(candidate);
      if (ok.success) questions.push(ok.data);
      else rejected.push(`${q.id}: ${ok.error.issues[0]?.message}`);
    }
    if (questions.length) await saveQuizQuestions(sectionId, questions);
    cb.onQuiz(questions.length);
    return `Saved ${questions.length} question(s).${rejected.length ? ` Rejected: ${rejected.join("; ")}` : ""}`;
  }

  throw new Error(`Unknown tool ${call.name}`);
}
