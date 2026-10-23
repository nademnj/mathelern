import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { GeneratedExercise } from "@/lib/generators/types";

const MODEL = "claude-sonnet-5-5";

// Mirrors GeneratedAnswer/GeneratedQuestion/SolutionStep shapes exactly, so an
// AI-authored exercise plugs into the same instance/attempt/grading pipeline
// as the deterministic PRNG generators with zero changes there.
const aiExerciseSchema = z.object({
  prompt: z.string().min(1),
  format: z.enum(["numeric", "fraction", "text"]),
  answer: z.object({
    value: z.number().optional(),
    numerator: z.number().optional(),
    denominator: z.number().optional(),
    text: z.string().optional(),
  }),
  solutionSteps: z.array(z.object({ label: z.string().min(1), expression: z.string().min(1) })).min(1).max(8),
});

// Grounded in the real structure of Bavarian Schulaufgaben/Abschlussprüfungen
// (multi-part tasks with point values "BE", Sachkontext word problems for
// functions/growth, a non-calculator warm-up part then a calculator part,
// standard exam verbs like "Bestimmen Sie"/"Begründen Sie"/"Skizzieren Sie")
// researched via web search -- not verbatim exam text, just house style.
function buildSystemPrompt(topicTitle: string, lehrplanRef: string, difficultyTier: number, avoidPrompts: string[]) {
  const avoidSection =
    avoidPrompts.length > 0
      ? `\n\nDiese Aufgaben wurden dem Schüler schon gestellt - erstelle etwas anderes (andere Zahlen, anderer Aufgabentyp innerhalb des Themas):\n${avoidPrompts.map((p) => `- ${p}`).join("\n")}`
      : "";

  return `Du bist eine erfahrene bayerische Mathematik-Lehrkraft (FOS/Mittelschule, LehrplanPLUS), die echte Prüfungsaufgaben im Stil einer Schulaufgabe/Abschlussprüfung erstellt - damit sich der Schüler optimal auf die Prüfung vorbereiten und die beste Note erreichen kann.

Thema: "${topicTitle}" (Lehrplanbezug: ${lehrplanRef})
Schwierigkeitsstufe: ${difficultyTier} von 5 (1 = einfache direkte Anwendung/Aufwärmaufgabe, wie der Einstieg einer Schulaufgabe; 5 = anspruchsvolle mehrschrittige Aufgabe mit Sachkontext oder Begründung, wie der Schlussteil einer Schulaufgabe).

Stil echter bayerischer Schulaufgaben, den du nachbilden sollst:
- Klare Aufgabenstellung mit den üblichen Prüfungsverben: "Bestimmen Sie", "Berechnen Sie", "Geben Sie an", "Untersuchen Sie", "Begründen Sie".
- Bei höheren Stufen (4-5): realistischer Sachkontext (z.B. Kosten/Gewinn-Funktion, Bestandsentwicklung, geometrischer Körper) statt nackter Formel.
- Exakt EINE Teilaufgabe mit GENAU EINEM konkreten, eindeutig prüfbarem Endergebnis (Zahl, Bruch, oder ein kurzes festes Wort wie "gerade"/"ungerade"/"ja"/"nein") - keine mehrteilige a)/b)/c)-Aufgabe, da nur eine Antwort geprüft werden kann.
- Realistische, "schöne" Zahlen wie in echten Prüfungen (keine hässlichen Dezimalzahlen, wenn vermeidbar).
- Antwortformat "text" NUR für kurze feste Begriffe (z.B. Symmetrie-Art), sonst "numeric" oder "fraction".
- solutionSteps: 3-6 nachvollziehbare Rechenschritte, wie ein Lösungsweg in einem Lösungsschlüssel.${avoidSection}

WICHTIG - Antwortformat: Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, keine Markdown-Codeblöcke, kein Text davor oder danach. Exaktes Format:
{"prompt": "...", "format": "numeric", "answer": {"value": 12.5}, "solutionSteps": [{"label": "...", "expression": "..."}]}
Für "fraction": "answer": {"numerator": 3, "denominator": 4}. Für "text": "answer": {"text": "gerade"}.`;
}

function parseAiExercise(rawText: string): GeneratedExercise {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const json = JSON.parse(cleaned);
  const parsed = aiExerciseSchema.parse(json);
  return {
    question: { prompt: parsed.prompt, format: parsed.format },
    answer: parsed.answer,
    solutionSteps: parsed.solutionSteps,
  };
}

export async function generateExamStyleExercise(context: {
  topicTitle: string;
  lehrplanRef: string;
  difficultyTier: number;
  avoidPrompts: string[];
}): Promise<GeneratedExercise> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    // Short, schema-constrained JSON generation doesn't need deep reasoning
    // -- "low" effort keeps the (billed) adaptive-thinking overhead small.
    output_config: { effort: "low" },
    system: buildSystemPrompt(context.topicTitle, context.lehrplanRef, context.difficultyTier, context.avoidPrompts),
    messages: [{ role: "user", content: "Erstelle die Prüfungsaufgabe jetzt." }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) throw new Error("Die KI hat keine Aufgabe geliefert.");

  try {
    return parseAiExercise(textBlock.text);
  } catch {
    throw new Error("Die KI-Antwort konnte nicht verarbeitet werden. Bitte nochmal versuchen.");
  }
}
