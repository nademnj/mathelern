"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface CurrentLessonScreen {
  kind: "lesson";
  lessonId: string;
  lessonTitle: string;
  currentStepIndex: number;
}

export interface CurrentExerciseScreen {
  kind: "exercise";
  topicSlug: string;
  topicTitle: string;
  questionPrompt: string;
  questionFormat: "numeric" | "fraction" | "text";
  lessonSummaryBullets: string[] | null;
  feedback: { isCorrect: boolean; solutionSteps: { label: string; expression: string }[] } | null;
}

export type CurrentScreen = CurrentLessonScreen | CurrentExerciseScreen;

interface CurrentScreenContextValue {
  currentScreen: CurrentScreen | null;
  setCurrentScreen: (screen: CurrentScreen | null) => void;
}

const CurrentScreenContext = createContext<CurrentScreenContextValue | null>(null);

// Bridges whatever's deep in the page tree (LessonPlayer, ExerciseRunner --
// each knows exactly what's rendered) to ChatWidget (lives in the layout,
// has no other way to know what the student is currently looking at).
export function CurrentScreenProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen | null>(null);
  return (
    <CurrentScreenContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </CurrentScreenContext.Provider>
  );
}

export function useCurrentScreen() {
  const ctx = useContext(CurrentScreenContext);
  if (!ctx) throw new Error("useCurrentScreen must be used within a CurrentScreenProvider");
  return ctx;
}
