"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface CurrentLesson {
  lessonId: string;
  lessonTitle: string;
  currentStepIndex: number;
}

interface CurrentLessonContextValue {
  currentLesson: CurrentLesson | null;
  setCurrentLesson: (lesson: CurrentLesson | null) => void;
}

const CurrentLessonContext = createContext<CurrentLessonContextValue | null>(null);

// Bridges LessonPlayer (deep in the page tree, knows exactly which
// storyboard step is on screen) to ChatWidget (lives in the layout, has no
// other way to know what the student is currently looking at).
export function CurrentLessonProvider({ children }: { children: ReactNode }) {
  const [currentLesson, setCurrentLesson] = useState<CurrentLesson | null>(null);
  return (
    <CurrentLessonContext.Provider value={{ currentLesson, setCurrentLesson }}>
      {children}
    </CurrentLessonContext.Provider>
  );
}

export function useCurrentLesson() {
  const ctx = useContext(CurrentLessonContext);
  if (!ctx) throw new Error("useCurrentLesson must be used within a CurrentLessonProvider");
  return ctx;
}
