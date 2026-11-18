"use client";

import { ChatPanel } from "./ChatPanel";

/** Tutor chat that knows which animal is on screen. */
export function SpeciesChat({ speciesId, lessonId, name }: { speciesId: string; lessonId?: string; name: string }) {
  return (
    <ChatPanel
      sectionId="wildtierkunde"
      lessonId={lessonId}
      speciesId={speciesId}
      title={`Ask about: ${name}`}
      suggestions={[
        "How do I tell this species apart from similar ones?",
        "What would an examiner ask me about this animal in the oral exam?",
        "Explain the hunting terms (Jägersprache) for this species",
      ]}
    />
  );
}
