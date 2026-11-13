/** Validates every content/sections/*.json file against the schema. */
import { listSections } from "../lib/content/store";

listSections()
  .then((sections) => {
    for (const s of sections) {
      const ids = new Set<string>();
      for (const q of s.quiz) {
        if (ids.has(q.id)) throw new Error(`${s.id}: duplicate quiz id ${q.id}`);
        ids.add(q.id);
        if (q.lessonId && !s.lessons.some((l) => l.id === q.lessonId)) throw new Error(`${s.id}: ${q.id} points at unknown lesson ${q.lessonId}`);
      }
      console.log(`✓ ${s.id}: ${s.lessons.length} lessons, ${s.quiz.length} questions`);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
