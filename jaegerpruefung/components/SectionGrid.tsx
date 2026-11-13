"use client";

import Link from "next/link";
import { useProgress, resetProgress } from "@/lib/client/progress";

interface SectionSummary {
  id: string;
  order: number;
  titleDe: string;
  titleEn: string;
  summaryEn: string;
  lessonIds: string[];
  questionIds: string[];
}

export function SectionGrid({ sections }: { sections: SectionSummary[] }) {
  const progress = useProgress();

  const totals = sections.reduce(
    (acc, s) => {
      acc.lessons += s.lessonIds.length;
      acc.read += s.lessonIds.filter((l) => progress.lessonsRead[`${s.id}/${l}`]).length;
      acc.questions += s.questionIds.length;
      acc.mastered += s.questionIds.filter((q) => progress.answers[`${s.id}/${q}`]?.lastCorrect).length;
      return acc;
    },
    { lessons: 0, read: 0, questions: 0, mastered: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
        <Stat label="Lessons read" value={`${totals.read} / ${totals.lessons}`} />
        <Stat label="Questions answered correctly (last try)" value={`${totals.mastered} / ${totals.questions}`} />
        <div className="ml-auto flex gap-2">
          <Link href="/quiz/all" className="btn-primary">Start mock exam</Link>
          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm("Reset all progress stored in this browser?")) resetProgress();
            }}
          >
            Reset progress
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const read = s.lessonIds.filter((l) => progress.lessonsRead[`${s.id}/${l}`]).length;
          const mastered = s.questionIds.filter((q) => progress.answers[`${s.id}/${q}`]?.lastCorrect).length;
          const pct = s.questionIds.length ? Math.round((mastered / s.questionIds.length) * 100) : 0;
          return (
            <div key={s.id} className="card flex flex-col gap-3 p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-accent">Sachgebiet {s.order}</div>
              <div>
                <h2 className="text-lg font-semibold leading-snug">{s.titleDe}</h2>
                <p className="text-sm text-muted">{s.titleEn}</p>
              </div>
              <p className="text-sm text-muted">{s.summaryEn}</p>
              <div className="mt-auto space-y-2 pt-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>{read}/{s.lessonIds.length} lessons read</span>
                  <span>{pct}% of quiz correct</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href={`/section/${s.id}`} className="btn-primary flex-1">Learn</Link>
                  <Link href={`/quiz/${s.id}`} className="btn-ghost flex-1">Quiz ({s.questionIds.length})</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
