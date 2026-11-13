"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/content/schema";
import { isAnswerCorrect, practiceOrder, shuffle } from "@/lib/quiz";
import { recordAnswer, useProgress } from "@/lib/client/progress";
import { ChatPanel, type ChatRequest } from "./ChatPanel";

export type QuizItem = QuizQuestion & { sectionId: string; sectionTitle: string; key: string };

const LETTERS = "ABCDE";

export function Quiz({ items, mode, perSection }: { items: QuizItem[]; mode: "practice" | "exam"; perSection?: number }) {
  const progress = useProgress();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [started, setStarted] = useState(mode === "practice");

  // Fix the question order once per round, so answering doesn't reshuffle it.
  const [round, setRound] = useState<QuizItem[] | null>(null);
  const questions = useMemo(() => {
    if (round) return round;
    if (mode === "exam") {
      const bySection = new Map<string, QuizItem[]>();
      for (const it of items) bySection.set(it.sectionId, [...(bySection.get(it.sectionId) ?? []), it]);
      return [...bySection.values()].flatMap((list) => shuffle(list, seed).slice(0, perSection ?? 10));
    }
    return practiceOrder(items, progress.answers, seed);
  }, [round, items, mode, perSection, seed, progress.answers]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, number[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showEn, setShowEn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chatRequest, setChatRequest] = useState<ChatRequest | null>(null);

  if (items.length === 0) {
    return <p className="card p-6 text-muted">No questions yet. Run the collector agent to create some.</p>;
  }

  const begin = () => {
    setRound(questions);
    setStarted(true);
  };
  const restart = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setRound(null);
    setIndex(0);
    setSelected({});
    setChecked({});
    setFinished(false);
    setStarted(mode === "practice");
  };

  if (!started) {
    const sectionCount = new Set(questions.map((q) => q.sectionId)).size;
    return (
      <div className="card space-y-4 p-6">
        <p>
          {questions.length} questions from {sectionCount} sections. Some questions have <strong>more than one correct answer</strong> —
          select all that apply.
        </p>
        <button className="btn-primary" onClick={begin}>Start</button>
      </div>
    );
  }

  const list = round ?? questions;
  if (finished) return <Results list={list} selected={selected} onRestart={restart} />;

  const q = list[index];
  const sel = selected[q.key] ?? [];
  const isChecked = mode === "practice" && checked[q.key];
  const correct = isAnswerCorrect(q, sel);

  const toggle = (i: number) => {
    if (isChecked) return;
    setSelected((s) => {
      const cur = s[q.key] ?? [];
      return { ...s, [q.key]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort() };
    });
  };

  const check = () => {
    // Freeze the order before recording, since recording changes the practice order.
    if (!round) setRound(list);
    setChecked((c) => ({ ...c, [q.key]: true }));
    recordAnswer(q.sectionId, q.id, correct);
  };

  const next = () => {
    if (index + 1 < list.length) {
      setIndex(index + 1);
      if (!round) setRound(list);
    } else {
      if (mode === "exam") list.forEach((it) => recordAnswer(it.sectionId, it.id, isAnswerCorrect(it, selected[it.key] ?? [])));
      setFinished(true);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Question {index + 1} / {list.length}
            {mode === "exam" && <> · {q.sectionTitle}</>}
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} />
            Show English
          </label>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-accent transition-all" style={{ width: `${((index + 1) / list.length) * 100}%` }} />
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <p className="text-lg font-medium" lang="de">{q.questionDe}</p>
            {showEn && <p className="mt-1 text-muted">{q.questionEn}</p>}
            <p className="mt-2 text-xs text-muted">Select all correct answers · Alle richtigen Antworten ankreuzen</p>
          </div>
          <ul className="space-y-2">
            {q.options.map((o, i) => {
              const picked = sel.includes(i);
              const isRight = q.correct.includes(i);
              let tone = picked ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2";
              if (isChecked) tone = isRight ? "border-ok bg-ok-soft" : picked ? "border-bad bg-bad-soft" : "border-border opacity-70";
              return (
                <li key={i}>
                  <button
                    onClick={() => toggle(i)}
                    aria-pressed={picked}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${tone}`}
                  >
                    <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border text-xs font-semibold ${picked ? "border-accent bg-accent text-white dark:text-bg" : "border-border"}`}>
                      {LETTERS[i]}
                    </span>
                    <span>
                      <span lang="de">{o.de}</span>
                      {showEn && <span className="block text-sm text-muted">{o.en}</span>}
                    </span>
                    {isChecked && isRight && <span className="ml-auto text-ok">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {isChecked && (
            <div className={`rounded-lg p-4 ${correct ? "bg-ok-soft" : "bg-bad-soft"}`}>
              <p className="font-semibold">{correct ? "Richtig! Correct." : `Leider falsch. Correct: ${q.correct.map((c) => LETTERS[c]).join(", ")}`}</p>
              <p className="mt-2" lang="de">{q.explanationDe}</p>
              <p className="mt-1 text-sm text-muted">{q.explanationEn}</p>
              {q.lessonId && (
                <Link className="mt-2 inline-block text-sm text-accent hover:underline" href={`/section/${q.sectionId}/${q.lessonId}`}>
                  Review the lesson →
                </Link>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {index > 0 && mode === "exam" && (
              <button className="btn-ghost" onClick={() => setIndex(index - 1)}>← Back</button>
            )}
            {mode === "practice" && !isChecked ? (
              <button className="btn-primary" disabled={sel.length === 0} onClick={check}>Check answer</button>
            ) : (
              <button className="btn-primary" onClick={next}>{index + 1 < list.length ? "Next →" : mode === "exam" ? "Hand in" : "Finish"}</button>
            )}
            {mode === "practice" && (
              <button className="btn-ghost" onClick={() => setFinished(true)}>End quiz</button>
            )}
          </div>
        </div>
      </div>

      {mode === "practice" ? (
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
          <ChatPanel
            key={q.key}
            title="Ask about this question"
            sectionId={q.sectionId}
            lessonId={q.lessonId}
            quiz={{ questionDe: q.questionDe, options: q.options.map((o) => o.de), correct: q.correct, explanationDe: q.explanationDe, answered: Boolean(isChecked) }}
            request={chatRequest}
          />
          {isChecked && !correct && (
            <button
              className="mt-2 text-sm text-accent hover:underline"
              onClick={() => setChatRequest({ id: Date.now(), text: `I chose ${sel.map((s) => LETTERS[s]).join(", ") || "nothing"}. Why is that wrong, and how do I remember the right answer?` })}
            >
              Why was my answer wrong?
            </button>
          )}
        </aside>
      ) : (
        <aside className="card h-fit space-y-2 p-4 text-sm">
          <h2 className="font-semibold">Answered</h2>
          <div className="flex flex-wrap gap-1">
            {list.map((it, i) => (
              <button
                key={it.key}
                onClick={() => setIndex(i)}
                className={`size-8 rounded text-xs ${i === index ? "ring-2 ring-accent" : ""} ${(selected[it.key] ?? []).length ? "bg-accent text-white dark:text-bg" : "bg-surface-2"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

function Results({ list, selected, onRestart }: { list: QuizItem[]; selected: Record<string, number[]>; onRestart: () => void }) {
  const answered = list.filter((q) => selected[q.key]?.length);
  const right = list.filter((q) => isAnswerCorrect(q, selected[q.key] ?? []));
  const bySection = new Map<string, { title: string; total: number; right: number }>();
  for (const q of list) {
    const e = bySection.get(q.sectionId) ?? { title: q.sectionTitle, total: 0, right: 0 };
    e.total++;
    if (isAnswerCorrect(q, selected[q.key] ?? [])) e.right++;
    bySection.set(q.sectionId, e);
  }
  const pct = list.length ? Math.round((right.length / list.length) * 100) : 0;
  const wrong = list.filter((q) => selected[q.key]?.length && !isAnswerCorrect(q, selected[q.key]));

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-6">
        <p className="text-3xl font-semibold">{pct}%</p>
        <p className="text-muted">
          {right.length} of {list.length} correct ({answered.length} answered).
        </p>
        {bySection.size > 1 && (
          <table className="w-full text-sm">
            <tbody>
              {[...bySection.values()].map((s) => (
                <tr key={s.title} className="border-t border-border">
                  <td className="py-2">{s.title}</td>
                  <td className="py-2 text-right">{s.right}/{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn-primary" onClick={onRestart}>New round</button>
      </div>
      {wrong.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Review your mistakes</h2>
          {wrong.map((q) => (
            <div key={q.key} className="card space-y-2 p-4 text-sm">
              <p className="font-medium" lang="de">{q.questionDe}</p>
              <p className="text-muted">{q.questionEn}</p>
              <p>
                Your answer: {(selected[q.key] ?? []).map((i) => LETTERS[i]).join(", ")} · Correct:{" "}
                {q.correct.map((i) => `${LETTERS[i]}) ${q.options[i].de}`).join("; ")}
              </p>
              <p className="text-muted">{q.explanationEn}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
