import type { QuizQuestion } from "./content/schema";

/** A question counts as correct only if exactly the right set of options is picked. */
export function isAnswerCorrect(question: Pick<QuizQuestion, "correct">, selected: number[]): boolean {
  const want = new Set(question.correct);
  const got = new Set(selected);
  return want.size === got.size && [...want].every((i) => got.has(i));
}

/** Deterministic shuffle so server and client agree for a given seed. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Orders questions for practice: never-seen first, then ones last answered
 * wrong, then the rest — so weak spots come back sooner.
 */
export function practiceOrder<T extends { key: string }>(
  items: T[],
  answers: Record<string, { lastCorrect: boolean }>,
  seed: number
): T[] {
  const rank = (k: string) => (!answers[k] ? 0 : answers[k].lastCorrect ? 2 : 1);
  return shuffle(items, seed).sort((a, b) => rank(a.key) - rank(b.key));
}
