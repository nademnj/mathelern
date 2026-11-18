"use client";

import Link from "next/link";
import { useState } from "react";
import type { OralSection } from "@/lib/content/schema";
import { rateOral, useProgress } from "@/lib/client/progress";
import { ChatPanel } from "./ChatPanel";
import { SpeakButton } from "./SpeakButton";

type Titled = OralSection & { order: number; titleDe: string; titleEn: string };

const RATING = {
  good: { label: "Knew it", cls: "bg-ok-soft text-ok" },
  partly: { label: "Partly", cls: "bg-accent-soft text-accent" },
  no: { label: "Didn't know", cls: "bg-bad-soft text-bad" },
} as const;

export function OralTrainer({ sections }: { sections: Titled[] }) {
  const progress = useProgress();
  const [active, setActive] = useState(sections[0]?.sectionId);
  const [view, setView] = useState<"cards" | "examiner">("cards");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showEn, setShowEn] = useState(false);
  const section = sections.find((s) => s.sectionId === active) ?? sections[0];
  if (!section) return null;

  const toggle = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1 text-sm" role="tablist">
        {sections.map((s) => {
          const done = s.items.filter((i) => progress.oral[i.id] === "good").length;
          return (
            <button
              key={s.sectionId}
              role="tab"
              aria-selected={s.sectionId === section.sectionId}
              onClick={() => setActive(s.sectionId)}
              className={`shrink-0 rounded-md px-3 py-1.5 ${s.sectionId === section.sectionId ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-text"}`}
            >
              SG {s.order} <span className="text-xs text-muted">({done}/{s.items.length})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          <span lang="de">{section.titleDe}</span> <span className="font-normal text-muted">· {section.titleEn}</span>
        </h2>
        <div className="flex gap-2 text-sm">
          <button className={view === "cards" ? "btn-primary" : "btn-ghost"} onClick={() => setView("cards")}>Practice cards</button>
          <button className={view === "examiner" ? "btn-primary" : "btn-ghost"} onClick={() => setView("examiner")}>AI examiner</button>
        </div>
      </div>

      {view === "cards" ? (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} /> Show English
          </label>
          <ol className="space-y-3">
            {section.items.map((item, idx) => {
              const isOpen = open.has(item.id);
              const rating = progress.oral[item.id];
              return (
                <li key={item.id} className="card space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium">{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium" lang="de">{item.questionDe}</p>
                      {showEn && <p className="text-sm text-muted">{item.questionEn}</p>}
                      <div className="mt-1 flex gap-3 text-xs">
                        <SpeakButton text={item.questionDe} />
                        {rating && <span className={`rounded-full px-2 py-0.5 ${RATING[rating].cls}`}>{RATING[rating].label}</span>}
                      </div>
                    </div>
                  </div>
                  {!isOpen ? (
                    <button className="btn-ghost w-full" onClick={() => toggle(item.id)}>Answer out loud, then show the model answer</button>
                  ) : (
                    <div className="space-y-3 rounded-lg bg-surface-2 p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <ul className="list-disc space-y-1 pl-5" lang="de">
                          {item.answerDe.map((a) => <li key={a}>{a}</li>)}
                        </ul>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                          {item.answerEn.map((a) => <li key={a}>{a}</li>)}
                        </ul>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted">How did you do?</span>
                        {(Object.keys(RATING) as (keyof typeof RATING)[]).map((r) => (
                          <button key={r} className={`rounded-full px-3 py-1 ${rating === r ? RATING[r].cls : "border border-border"}`} onClick={() => rateOral(item.id, r)}>
                            {RATING[r].label}
                          </button>
                        ))}
                        <span className="ml-auto flex gap-3">
                          {item.speciesId && <Link className="text-accent hover:underline" href={`/arten/${item.speciesId}`}>Species profile</Link>}
                          {item.lessonId && <Link className="text-accent hover:underline" href={`/section/${section.sectionId}/${item.lessonId}`}>Lesson</Link>}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className="h-[36rem]">
          <ChatPanel
            key={section.sectionId}
            sectionId={section.sectionId}
            mode="examiner"
            oralSectionId={section.sectionId}
            title={`Prüfer · Examiner – SG ${section.order}`}
            intro="The AI examiner asks you one question at a time in German (with an English translation), then tells you what was right, what was missing, and how to say it in German. Answer by typing or with the 🎤 microphone. Write “Ende” to get an overall rating."
            suggestions={["Guten Tag, ich bin bereit. Bitte beginnen Sie mit der ersten Frage.", "Please start — and keep the questions simple, I'm a beginner."]}
          />
        </div>
      )}
    </div>
  );
}
