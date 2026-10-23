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

// Single tool, forced via tool_choice, so the model's reply is always this
// exact shape -- no free-text parsing, no "almost JSON" failures.
const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond_to_student",
  description: "Send a reply to the student in the chat tutor.",
  input_schema: {
    type: "object",
    properties: {
      chatMessage: {
        type: "string",
        description: "The conversational reply shown in the chat bubble. Keep it short (2-4 sentences), friendly, and in German.",
      },
      visualExplanation: {
        type: "object",
        description:
          "Only include this when a plain-text answer likely won't land -- e.g. the student says they still don't get it, or the concept is genuinely easier to show step-by-step. Omit entirely for ordinary questions.",
        properties: {
          title: { type: "string", description: "Short title for the mini step-by-step explanation." },
          steps: {
            type: "array",
            minItems: 2,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                label: { type: "string", description: "Short label for this step, e.g. 'Formel' or 'Einsetzen'." },
                expression: { type: "string", description: "The math expression or short text for this step." },
              },
              required: ["label", "expression"],
            },
          },
        },
        required: ["title", "steps"],
      },
    },
    required: ["chatMessage"],
  },
};

function buildSystemPrompt(gradeLevel: number, schoolTrackLabel: string, topicTitle: string | null) {
  return `Du bist ein geduldiger, freundlicher Mathe-Nachhilfelehrer für einen Schüler der ${gradeLevel}. Klasse (${schoolTrackLabel}) nach dem bayerischen LehrplanPLUS. Der Schüler hat oft wenig Konzentrationsausdauer, also:
- Antworte kurz (2-4 Sätze), klar und ermutigend, auf Deutsch.
- Erkläre Schritt für Schritt, nicht alles auf einmal.
- Bleibe beim Thema Mathematik; bei anderen Themen lenke freundlich zurück zur Matheaufgabe.
- Wenn der Schüler sagt, er versteht es immer noch nicht, oder wenn eine schrittweise visuelle Aufschlüsselung wirklich helfen würde, nutze das visualExplanation-Feld für eine kurze Schritt-für-Schritt-Erklärung (2-6 Schritte). Nutze es NICHT für jede Antwort - nur wenn eine normale Textantwort nicht reicht.
${topicTitle ? `Der Schüler befindet sich gerade im Thema "${topicTitle}".` : ""}`;
}

export async function askTutor(
  history: ChatTurn[],
  context: { gradeLevel: number; schoolTrackLabel: string; topicTitle: string | null }
): Promise<TutorResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(context.gradeLevel, context.schoolTrackLabel, context.topicTitle),
    tools: [RESPOND_TOOL],
    tool_choice: { type: "tool", name: "respond_to_student" },
    messages: history.map((turn) => ({
      role: turn.role === "student" ? "user" : "assistant",
      content: turn.content,
    })),
  });

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) throw new Error("Tutor response did not include the expected tool call.");

  const parsed = tutorResponseSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Tutor response failed validation: ${parsed.error.message}`);
  }

  return parsed.data;
}
