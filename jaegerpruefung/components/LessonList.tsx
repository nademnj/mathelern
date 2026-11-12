"use client";

import Link from "next/link";
import { useProgress } from "@/lib/client/progress";

interface Item {
  id: string;
  titleDe: string;
  titleEn: string;
  origin: "seed" | "agent";
  paragraphs: number;
  questions: number;
}

export function LessonList({ sectionId, lessons }: { sectionId: string; lessons: Item[] }) {
  const progress = useProgress();
  if (lessons.length === 0) {
    return <p className="card p-6 text-muted">No lessons yet. Run the collector agent to gather material for this section.</p>;
  }
  return (
    <ol className="space-y-2">
      {lessons.map((l, i) => {
        const read = Boolean(progress.lessonsRead[`${sectionId}/${l.id}`]);
        return (
          <li key={l.id}>
            <Link href={`/section/${sectionId}/${l.id}`} className="card flex items-center gap-4 p-4 hover:bg-surface-2">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  read ? "bg-accent text-white dark:text-bg" : "bg-surface-2 text-muted"
                }`}
              >
                {read ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{l.titleDe}</span>
                <span className="block text-sm text-muted">{l.titleEn}</span>
              </span>
              <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
                {l.paragraphs} paragraphs · {l.questions} questions
                <br />
                {l.origin === "agent" ? "collected by agent" : "starter material"}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
