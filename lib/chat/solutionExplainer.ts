import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";

const explainedStepSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  // Must be exactly one of the candidate slugs we gave the model, or null --
  // verified again server-side so a hallucinated slug can never become a link.
  relatedTopicSlug: z.string().nullable().default(null),
  relatedTopicTitle: z.string().nullable().default(null),
});

const explanationSchema = z.object({
  steps: z.array(explainedStepSchema).min(1).max(10),
});

export type ExplainedStep = z.infer<typeof explainedStepSchema>;

function buildSystemPrompt(
  questionPrompt: string,
  basicSteps: { label: string; expression: string }[],
  topicTitle: string,
  candidateTopics: { slug: string; title: string }[]
) {
  const stepsText = basicSteps.map((s, i) => `${i + 1}. ${s.label}: ${s.expression}`).join("\n");
  const candidatesText =
    candidateTopics.length > 0
      ? candidateTopics.map((t) => `- "${t.slug}": ${t.title}`).join("\n")
      : "(keine)";

  return `Du bist ein geduldiger Mathe-Lehrer. Ein Schüler hat gerade diese Aufgabe aus dem Thema "${topicTitle}" bearbeitet:

"${questionPrompt}"

Der knappe Lösungsweg lautet:
${stepsText}

Erkläre jeden Schritt ausführlich für einen Schüler, der es noch nicht ganz verstanden hat: WAS wird gemacht, WARUM (welche Regel/Idee steckt dahinter) und WIE (konkret vorgerechnet). 2-4 Sätze pro Schritt, einfaches Deutsch.

Falls ein Schritt auf Wissen aus einem ANDEREN Thema aufbaut, das unten in der Liste steht (z.B. eine Rechenregel, die dort gelehrt wird), nenne dessen exakten Slug in "relatedTopicSlug" - aber NUR wenn es wirklich thematisch zusammenhängt, sonst lass es weg (null). Erfinde niemals einen Slug, der nicht in der Liste steht.

Verfügbare Themen zum Verlinken:
${candidatesText}

WICHTIG - Antwortformat: Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, keine Markdown-Codeblöcke, kein Text davor oder danach. Exaktes Format:
{"steps": [{"title": "kurzer Titel", "explanation": "ausführliche Erklärung", "relatedTopicSlug": null, "relatedTopicTitle": null}]}
Wenn relatedTopicSlug gesetzt ist, setze relatedTopicTitle auf den exakten Titel aus der Liste.`;
}

export async function explainExerciseSolution(context: {
  questionPrompt: string;
  basicSteps: { label: string; expression: string }[];
  topicTitle: string;
  candidateTopics: { slug: string; title: string }[];
}): Promise<ExplainedStep[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1400,
    output_config: { effort: "low" },
    system: buildSystemPrompt(context.questionPrompt, context.basicSteps, context.topicTitle, context.candidateTopics),
    messages: [{ role: "user", content: "Erkläre die Lösung jetzt." }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) throw new Error("Die KI hat keine Erklärung geliefert.");

  const cleaned = textBlock.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  let parsed;
  try {
    parsed = explanationSchema.parse(JSON.parse(cleaned));
  } catch {
    throw new Error("Die Erklärung konnte nicht verarbeitet werden. Bitte nochmal versuchen.");
  }

  // Never trust the model's slug (or title) claim on its own -- only keep
  // it, and always use OUR title text, if the slug genuinely matches a
  // topic we offered.
  const bySlug = new Map(context.candidateTopics.map((t) => [t.slug, t.title]));
  return parsed.steps.map((s) => {
    const title = s.relatedTopicSlug ? bySlug.get(s.relatedTopicSlug) : undefined;
    return {
      ...s,
      relatedTopicSlug: title ? s.relatedTopicSlug : null,
      relatedTopicTitle: title ?? null,
    };
  });
}
