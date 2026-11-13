import { describe, expect, it } from "vitest";
import { listSections } from "@/lib/content/store";

describe("content files", () => {
  it("all validate and quiz questions point at existing lessons", async () => {
    const sections = await listSections();
    expect(sections.length).toBeGreaterThanOrEqual(6);
    for (const s of sections) {
      const lessonIds = new Set(s.lessons.map((l) => l.id));
      for (const q of s.quiz) if (q.lessonId) expect(lessonIds.has(q.lessonId), `${s.id}/${q.id}`).toBe(true);
      expect(new Set(s.quiz.map((q) => q.id)).size).toBe(s.quiz.length);
    }
  });
});
