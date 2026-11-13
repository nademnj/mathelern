"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { KeyTerm, Lesson } from "@/lib/content/schema";
import { markLessonRead } from "@/lib/client/progress";
import { ChatPanel, type ChatRequest } from "./ChatPanel";
import { SpeakButton } from "./SpeakButton";

type Mode = "side" | "reveal" | "de" | "en";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "side", label: "Side by side", hint: "German and English next to each other" },
  { id: "reveal", label: "German first", hint: "Read the German, tap a paragraph to reveal the English" },
  { id: "de", label: "German only", hint: "Exam practice: German only" },
  { id: "en", label: "English only", hint: "Translation only" },
];

export function LessonReader({ sectionId, lesson }: { sectionId: string; lesson: Lesson }) {
  const [mode, setMode] = useState<Mode>("side");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [chatRequest, setChatRequest] = useState<ChatRequest | null>(null);

  useEffect(() => {
    markLessonRead(sectionId, lesson.id);
  }, [sectionId, lesson.id]);

  const toggleReveal = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const explain = (i: number) =>
    setChatRequest({
      id: Date.now(),
      text: `Please explain paragraph ${i + 1} to me: what does it say, which words are important, and what do I need to remember for the exam?`,
      focus: lesson.paragraphs[i].de,
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <article className="min-w-0 space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold" lang="de">{lesson.titleDe}</h1>
          <p className="text-muted">{lesson.titleEn}</p>
        </header>

        <div className="flex flex-wrap gap-1 rounded-lg bg-surface-2 p-1 text-sm" role="tablist" aria-label="Reading mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              title={m.hint}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1.5 ${mode === m.id ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-text"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === "reveal" && <p className="text-sm text-muted">Tap a German paragraph to show its translation.</p>}

        <div className="space-y-4">
          {lesson.paragraphs.map((p, i) => {
            const showDe = mode !== "en";
            const showEn = mode === "side" || mode === "en" || (mode === "reveal" && revealed.has(i));
            return (
              <div key={i} className={`card p-4 ${p.quote ? "border-l-4 border-l-warn" : ""}`}>
                {p.quote && <div className="mb-2 text-xs font-medium uppercase tracking-wide text-warn">Gesetzestext · statute (verbatim)</div>}
                <div className={`grid gap-4 ${mode === "side" ? "md:grid-cols-2" : ""}`}>
                  {showDe && (
                    <div
                      lang="de"
                      className={`leading-relaxed ${p.quote ? "rounded bg-quote p-2" : ""} ${mode === "reveal" ? "cursor-pointer" : ""}`}
                      onClick={mode === "reveal" ? () => toggleReveal(i) : undefined}
                    >
                      <HighlightedTerms text={p.de} terms={lesson.keyTerms} />
                    </div>
                  )}
                  {showEn && <div className={`leading-relaxed ${mode === "en" ? "" : "text-muted"}`}>{p.en}</div>}
                </div>
                <div className="mt-3 flex gap-3 text-xs">
                  <button className="text-accent hover:underline" onClick={() => explain(i)}>Ask the tutor about this</button>
                  <SpeakButton text={p.de} />
                </div>
              </div>
            );
          })}
        </div>

        {lesson.keyTerms.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-3 font-semibold">Key terms · Fachbegriffe</h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {lesson.keyTerms.map((t) => (
                <div key={t.de}>
                  <dt className="font-medium" lang="de">
                    {t.de} <span className="font-normal text-muted">— {t.en}</span>
                  </dt>
                  {t.note && <dd className="text-sm text-muted">{t.note}</dd>}
                </div>
              ))}
            </dl>
          </section>
        )}

        {lesson.sources.length > 0 && (
          <section className="text-sm">
            <h2 className="mb-1 font-semibold">Sources · Quellen</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {lesson.sources.map((s) => (
                <li key={s.url}>
                  <a className="text-accent hover:underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              {lesson.origin === "agent" ? "Collected by the agent" : "Starter material"} · updated {lesson.updatedAt.slice(0, 10)}.
              Check the official text before relying on legal details.
            </p>
          </section>
        )}
      </article>

      <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
        <ChatPanel sectionId={sectionId} lessonId={lesson.id} request={chatRequest} />
      </aside>
    </div>
  );
}

/** Underlines key terms in the German text; hovering/tapping shows the English. */
function HighlightedTerms({ text, terms }: { text: string; terms: KeyTerm[] }): ReactNode {
  const usable = terms.filter((t) => t.de.length >= 3).sort((a, b) => b.de.length - a.de.length);
  if (usable.length === 0) return text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${usable.map((t) => escape(t.de)).join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) => {
    const term = i % 2 === 1 ? usable.find((t) => t.de.toLowerCase() === part.toLowerCase()) : undefined;
    if (!term) return <span key={i}>{part}</span>;
    return (
      <abbr
        key={i}
        title={`${term.en}${term.note ? ` — ${term.note}` : ""}`}
        className="cursor-help underline decoration-accent decoration-dotted decoration-2 underline-offset-4"
      >
        {part}
      </abbr>
    );
  });
}
