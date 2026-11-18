import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getSection, listOral, listSections, listSpecies } from "@/lib/content/store";

describe("species and oral content", () => {
  it("every species validates, has a local image and links an existing lesson", async () => {
    const species = await listSpecies();
    const lessons = new Set((await getSection("wildtierkunde"))!.lessons.map((l) => l.id));
    expect(species.length).toBeGreaterThanOrEqual(50);
    expect(new Set(species.map((s) => s.id)).size).toBe(species.length);
    for (const s of species) {
      expect(s.image, s.id).toBeDefined();
      expect(existsSync(path.join(process.cwd(), "public", s.image!.src)), s.image!.src).toBe(true);
      if (s.lessonId) expect(lessons.has(s.lessonId), `${s.id} -> ${s.lessonId}`).toBe(true);
      expect(s.facts.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("oral questions cover all six sections and point at real lessons and species", async () => {
    const [oral, sections, species] = await Promise.all([listOral(), listSections(), listSpecies()]);
    expect(new Set(oral.map((o) => o.sectionId))).toEqual(new Set(sections.map((s) => s.id)));
    const ids = new Set<string>();
    for (const o of oral) {
      const lessons = new Set(sections.find((s) => s.id === o.sectionId)!.lessons.map((l) => l.id));
      for (const i of o.items) {
        expect(ids.has(i.id), i.id).toBe(false);
        ids.add(i.id);
        if (i.lessonId) expect(lessons.has(i.lessonId), `${i.id} -> ${i.lessonId}`).toBe(true);
        if (i.speciesId) expect(species.some((s) => s.id === i.speciesId), i.speciesId).toBe(true);
      }
    }
  });
});
