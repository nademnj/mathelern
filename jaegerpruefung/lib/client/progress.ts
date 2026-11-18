"use client";

import { useSyncExternalStore } from "react";

/** Per-learner progress, kept in this browser only. */
export interface Progress {
  lessonsRead: Record<string, string>; // "section/lesson" -> ISO date
  answers: Record<string, { attempts: number; correct: number; lastCorrect: boolean }>; // "section/question"
  oral: Record<string, "good" | "partly" | "no">; // oral question id -> self-rating
}

const KEY = "jagd-progress-v1";
const EMPTY: Progress = { lessonsRead: {}, answers: {}, oral: {} };
let cache: Progress | null = null;
const listeners = new Set<() => void>();

/**
 * Lessons that moved to another section when the app switched to the six
 * Bavarian subject areas. Old progress keys are rewritten on load.
 */
const MOVED: [string, string][] = [
  ["wildbrethygiene/", "jagdbetrieb/"],
  ["jagdbetrieb/hege-und-wildschaden", "naturschutz/hege-und-wildschaden"],
  ["jagdbetrieb/betrieb-wildschaden-arten", "naturschutz/betrieb-wildschaden-arten"],
  ["jagdbetrieb/betrieb-wildschaden-frist", "naturschutz/betrieb-wildschaden-frist"],
  ["jagdbetrieb/betrieb-jagdschaden", "naturschutz/betrieb-jagdschaden"],
  ["jagdbetrieb/betrieb-schaele", "naturschutz/betrieb-schaele"],
];

export function migrateKeys<T>(record: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(record)) {
    const move = MOVED.find(([from]) => (from.endsWith("/") ? key.startsWith(from) : key === from));
    out[move ? move[1] + key.slice(move[0].length) : key] = value;
  }
  return out;
}

function load(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: Progress = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    cache = { lessonsRead: migrateKeys(parsed.lessonsRead), answers: migrateKeys(parsed.answers), oral: parsed.oral ?? {} };
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

export function rateOral(id: string, rating: "good" | "partly" | "no") {
  const p = load();
  save({ ...p, oral: { ...p.oral, [id]: rating } });
}
