import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";

const tutorResponseSchema = z.object({
  chatMessage: z.string().min(1),
  visualExplanation: z
    .object({
      title: z.string().min(1),
      steps: z.array(z.object({ label: z.string().min(1), expression: z.string().min(1) })).min(2).max(6),
    })
    .optional(),
});

export type TutorResponse = z.infer<typeof tutorResponseSchema>;

export interface ChatTurn {
  role: "student" | "assistant";
  content: string;
}

export interface LessonInfo {
  title: string;
  /** Every beat's narration text, in the exact order the student sees them. */
  orderedNarrations: string[];
  /** 0-based index into orderedNarrations of what's on screen right now. */
  currentStepIndex: number;
}

function buildLessonSection(lessonInfo: LessonInfo | null): string {
  if (!lessonInfo) return "";
  const lines = lessonInfo.orderedNarrations
    .map((text, i) => `${i + 1}. ${text}${i === lessonInfo.currentStepIndex ? "   <-- GENAU HIER ist der Schüler GERADE" : ""}`)
    .join("\n");
  return `\n\nDer Schüler schaut sich gerade die Lektion "${lessonInfo.title}" an. Das ist der vollständige Text der Lektion, in der Reihenfolge, wie der Schüler ihn durchklickt:
${lines}

Der Schüler ist GERADE auf Schritt ${lessonInfo.currentStepIndex + 1} von ${lessonInfo.orderedNarrations.length} (oben markiert). Wenn der Schüler nach "das hier", "dieser Teil" o.ä. fragt, oder allgemein um Hilfe bittet, bezieht sich das auf GENAU DIESEN Schritt, nicht auf die Lektion als Ganzes - erkläre bevorzugt diesen Teil, kannst aber auf frühere Schritte verweisen, wenn das hilft.`;
}

// Some API keys/models reject a forced tool_choice (400: "tool_choice: type
// \"tool\" and \"any\" are not supported for this model"), so instead of
// Anthropic tool-use we ask for plain JSON in the response text and parse
// it ourselves -- works with any key, at the cost of needing a defensive
// parse (code fences stripped, a few wording variants tolerated) and a
// plain-text fallback if the model ever doesn't comply.
function buildSystemPrompt(
  gradeLevel: number,
  schoolTrackLabel: string,
  topicTitle: string | null,
  lessonInfo: LessonInfo | null
) {
  return `Du bist ein geduldiger, freundlicher Mathe-Nachhilfelehrer für einen Schüler der ${gradeLevel}. Klasse (${schoolTrackLabel}) nach dem bayerischen LehrplanPLUS. Der Schüler hat oft wenig Konzentrationsausdauer, also:
- Antworte kurz (2-4 Sätze), klar und ermutigend, auf Deutsch.
- Erkläre Schritt für Schritt, nicht alles auf einmal.
- Bleibe beim Thema Mathematik; bei anderen Themen lenke freundlich zurück zur Matheaufgabe.
- Wenn der Schüler sagt, er versteht es immer noch nicht, oder wenn eine schrittweise visuelle Aufschlüsselung wirklich helfen würde, füge eine kurze Schritt-für-Schritt-Erklärung hinzu (2-6 Schritte). Nutze das NICHT für jede Antwort - nur wenn eine normale Textantwort nicht reicht.
${topicTitle ? `Der Schüler befindet sich gerade im Thema "${topicTitle}".` : ""}${buildLessonSection(lessonInfo)}

WICHTIG - Antwortformat: Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, keine Markdown-Codeblöcke, kein Text davor oder danach. Exaktes Format:
{"chatMessage": "deine Antwort hier", "visualExplanation": {"title": "kurzer Titel", "steps": [{"label": "...", "expression": "..."}]}}
Das Feld "visualExplanation" ist optional - lass es komplett weg, wenn keine Schritt-für-Schritt-Erklärung nötig ist.`;
}

function parseTutorResponse(rawText: string): TutorResponse {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try {
    const json = JSON.parse(cleaned);
    const parsed = tutorResponseSchema.safeParse(json);
    if (parsed.success) return parsed.data;
  } catch {
    // fall through to plain-text fallback below
  }
  // The model didn't comply with the JSON format -- still give the student
  // an answer rather than a hard error.
  return { chatMessage: rawText.trim() };
}

export async function askTutor(
  history: ChatTurn[],
  context: {
    gradeLevel: number;
    schoolTrackLabel: string;
    topicTitle: string | null;
    lessonInfo: LessonInfo | null;
  }
): Promise<TutorResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    // Short tutoring replies don't need the default "high" reasoning depth;
    // "medium" keeps answer quality while capping billed thinking tokens.
    output_config: { effort: "medium" },
    system: buildSystemPrompt(context.gradeLevel, context.schoolTrackLabel, context.topicTitle, context.lessonInfo),
    messages: history.map((turn) => ({
      role: turn.role === "student" ? "user" : "assistant",
      content: turn.content,
    })),
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) throw new Error("Der Tutor hat keine Antwort geschickt.");

  return parseTutorResponse(textBlock.text);
}
