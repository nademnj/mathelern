"use client";

import { useSyncExternalStore } from "react";

/** Per-learner progress, kept in this browser only. */
export interface Progress {
  lessonsRead: Record<string, string>; // "section/lesson" -> ISO date
  answers: Record<string, { attempts: number; correct: number; lastCorrect: boolean }>; // "section/question"
}

const KEY = "jagd-progress-v1";
const EMPTY: Progress = { lessonsRead: {}, answers: {} };
let cache: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function save(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: progress just won't persist
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => EMPTY
  );
}

export function markLessonRead(sectionId: string, lessonId: string) {
  const p = load();
  const key = `${sectionId}/${lessonId}`;
  if (p.lessonsRead[key]) return;
  save({ ...p, lessonsRead: { ...p.lessonsRead, [key]: new Date().toISOString() } });
}

export function recordAnswer(sectionId: string, questionId: string, isCorrect: boolean) {
  const p = load();
  const key = `${sectionId}/${questionId}`;
  const prev = p.answers[key] ?? { attempts: 0, correct: 0, lastCorrect: false };
  save({
    ...p,
    answers: {
      ...p.answers,
      [key]: { attempts: prev.attempts + 1, correct: prev.correct + (isCorrect ? 1 : 0), lastCorrect: isCorrect },
    },
  });
}

export function resetProgress() {
  save(EMPTY);
}
