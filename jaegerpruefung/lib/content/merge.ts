import type { Lesson, QuizQuestion } from "./schema";

/** Replace the lesson with the same id, or append it. Keeps the original order. */
export function mergeLesson(lessons: Lesson[], lesson: Lesson): Lesson[] {
  const i = lessons.findIndex((l) => l.id === lesson.id);
  if (i === -1) return [...lessons, lesson];
  const copy = [...lessons];
  copy[i] = lesson;
  return copy;
}

/**
 * Add new questions; a question whose id already exists replaces the old one.
 * Questions whose German text is identical to an existing one are skipped, so
 * re-running the agent doesn't fill the quiz with duplicates.
 */
export function mergeQuiz(existing: QuizQuestion[], incoming: QuizQuestion[]): QuizQuestion[] {
  const result = [...existing];
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  for (const q of incoming) {
    const byId = result.findIndex((e) => e.id === q.id);
    if (byId !== -1) {
      result[byId] = q;
      continue;
    }
    if (result.some((e) => norm(e.questionDe) === norm(q.questionDe))) continue;
    result.push(q);
  }
  return result;
}
