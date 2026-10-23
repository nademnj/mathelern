"use client";

import { EquationStepReveal } from "@/components/visuals/EquationStepReveal";

export interface ChatMessageBubbleProps {
  role: "student" | "assistant";
  content: string;
  generatedTitle: string | null;
  generatedSteps: { label: string; expression: string }[] | null;
}

export function ChatMessageBubble({ role, content, generatedTitle, generatedSteps }: ChatMessageBubbleProps) {
  const isStudent = role === "student";

  function speak() {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "de-DE";
      window.speechSynthesis.speak(utterance);
    } catch {
      // Web Speech API unavailable (unsupported browser) -- fail silently, text is still shown.
    }
  }

  return (
    <div className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isStudent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {!isStudent && (
          <button
            onClick={speak}
            className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
          >
            🔊 Vorlesen
          </button>
        )}
        {generatedSteps && generatedSteps.length > 0 && (
          <div className="mt-2 rounded-md border border-border bg-background p-2 text-foreground">
            {generatedTitle && <p className="mb-2 text-xs font-medium">{generatedTitle}</p>}
            <EquationStepReveal steps={generatedSteps} />
          </div>
        )}
      </div>
    </div>
  );
}
