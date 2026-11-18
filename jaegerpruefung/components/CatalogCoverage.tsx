import Link from "next/link";
import type { CatalogTopic, Lesson } from "@/lib/content/schema";

/** Shows every topic of the official Bavarian catalogue for a section and which lessons cover it. */
export function CatalogCoverage({ sectionId, topics, lessons }: { sectionId: string; topics: CatalogTopic[]; lessons: Pick<Lesson, "id" | "titleDe">[] }) {
  if (topics.length === 0) return null;
  const covered = topics.filter((t) => t.lessonIds.length > 0);
  const weightTotal = topics.reduce((n, t) => n + t.officialQuestions, 0);
  const weightCovered = covered.reduce((n, t) => n + t.officialQuestions, 0);
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Official catalogue topics (Bayern)</h2>
        <p className="text-sm text-muted">
          {covered.length} of {topics.length} topics have a lesson · these topics hold {weightCovered} of the {weightTotal} official
          catalogue questions in this section.
        </p>
      </div>
      <ul className="divide-y divide-border text-sm">
        {topics.map((t) => (
          <li key={t.code} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
            <span className="w-14 shrink-0 font-mono text-xs text-muted">{t.code}</span>
            <span className="min-w-0 flex-1">
              <span lang="de">{t.titleDe}</span>
              <span className="block text-xs text-muted">{t.titleEn} · {t.officialQuestions} official questions</span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              {t.lessonIds.length === 0 ? (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">not covered yet</span>
              ) : (
                t.lessonIds.map((id) => (
                  <Link key={id} href={`/section/${sectionId}/${id}`} className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent hover:underline">
                    {lessons.find((l) => l.id === id)?.titleDe ?? id}
                  </Link>
                ))
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
