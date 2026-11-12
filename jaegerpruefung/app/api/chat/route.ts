import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FALLBACK_BETA, MODEL, getClient, hasApiKey } from "@/lib/claude";
import { getSection } from "@/lib/content/store";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
  sectionId: z.string().optional(),
  lessonId: z.string().optional(),
  /** The quiz question on screen, if the learner is asking from the quiz. */
  quizQuestion: z
    .object({
      questionDe: z.string(),
      options: z.array(z.string()),
      correct: z.array(z.number()),
      explanationDe: z.string(),
      answered: z.boolean(),
    })
    .optional(),
  /** Which paragraph the learner clicked "Explain" on. */
  focusParagraph: z.string().max(4000).optional(),
});

const SYSTEM = `You are a patient tutor helping an English-speaking learner prepare for the German hunting licence exam (Jägerprüfung). The learner reads German study material with an English translation beside it.

- Answer in English unless the learner writes in German. Keep German technical terms (Jägersprache, legal terms) in German with the English meaning in parentheses, because the exam is in German.
- Be concise: a short paragraph or a few bullet points. Use a small example or a memory hook (Eselsbrücke) when it helps.
- When asked to explain a German sentence, break it down: meaning, key words, grammar that might confuse a learner, and why it matters for the exam.
- Hunting law partly differs between German states; say so when a rule is state-specific, and point the learner to the official text for anything legally binding.
- If a quiz question is on screen and the learner has not answered yet, give a hint, not the answer, unless they ask for it.
- Stay on hunting, wildlife, firearms law, game meat hygiene, dogs, nature conservation and the German language of the exam.`;

export async function POST(req: Request) {
  if (!hasApiKey()) {
    return new Response("The tutor needs ANTHROPIC_API_KEY in .env.local.", { status: 503 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  const { messages, sectionId, lessonId, quizQuestion, focusParagraph } = parsed.data;
  if (messages[0].role !== "user") return new Response("Bad request", { status: 400 });

  // Context is looked up on the server, so the client can't inject a fake lesson.
  let context = "";
  if (sectionId) {
    const section = await getSection(sectionId);
    if (section) {
      context += `\n\nExam section: ${section.titleDe} (${section.titleEn}).`;
      const lesson = section.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        context += `\nThe learner is reading the lesson "${lesson.titleDe}" (${lesson.titleEn}):\n`;
        context += lesson.paragraphs.map((p, i) => `[${i + 1}] DE: ${p.de}\n    EN: ${p.en}`).join("\n");
      }
    }
  }
  if (focusParagraph) context += `\n\nThe learner selected this passage to ask about:\n"${focusParagraph}"`;
  if (quizQuestion) {
    context += `\n\nQuiz question on screen: ${quizQuestion.questionDe}\nOptions:\n${quizQuestion.options
      .map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`)
      .join("\n")}\nCorrect: ${quizQuestion.correct.map((i) => String.fromCharCode(65 + i)).join(", ")}\nExplanation: ${quizQuestion.explanationDe}\nThe learner has ${quizQuestion.answered ? "already answered" : "NOT answered yet"}.`;
  }

  const client = getClient();
  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 4000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        ...(context ? [{ type: "text" as const, text: context }] : []),
      ],
      messages: messages as Anthropic.Beta.BetaMessageParam[],
    },
    { signal: req.signal }
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n(The tutor couldn't answer that one.)"));
      } catch (err) {
        const msg = err instanceof Anthropic.APIError ? `API error ${err.status}` : "Connection problem";
        controller.enqueue(encoder.encode(`\n\n(${msg} - please try again.)`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
