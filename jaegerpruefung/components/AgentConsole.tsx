"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CollectorEvent } from "@/lib/agent/collector";

const STATES = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern",
  "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen",
];

export function AgentConsole({
  sections,
  initialSection,
}: {
  sections: { id: string; title: string; lessons: number }[];
  initialSection?: string;
}) {
  const [sectionId, setSectionId] = useState(sections.some((s) => s.id === initialSection) ? initialSection! : sections[0]?.id);
  const [state, setState] = useState("Bayern");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jagd-state");
      if (saved && STATES.includes(saved)) setState(saved);
    } catch {}
  }, []);
  const [focus, setFocus] = useState("");
  const [maxLessons, setMaxLessons] = useState(2);
  const [events, setEvents] = useState<CollectorEvent[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setEvents([]);
    setRunning(true);
    try {
      localStorage.setItem("jagd-state", state);
    } catch {}
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, state, focus: focus.trim() || undefined, maxLessons }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        const parsed = lines.filter(Boolean).map((l) => JSON.parse(l) as CollectorEvent);
        if (parsed.length) setEvents((e) => [...e, ...parsed]);
      }
    } catch (err) {
      const message = (err as Error).name === "AbortError" ? "Stopped." : (err as Error).message;
      setEvents((e) => [...e, { type: "error", message }]);
    } finally {
      setRunning(false);
    }
  };

  const done = events.find((e): e is Extract<CollectorEvent, { type: "done" }> => e.type === "done");

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form
        className="card h-fit space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <Field label="Exam section">
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="input">
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.lessons} lessons)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Your federal state (Bundesland)">
          <select value={state} onChange={(e) => setState(e.target.value)} className="input">
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Focus (optional)">
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Schwarzwild: Biologie und Bejagung"
            maxLength={300}
            className="input"
          />
        </Field>
        <Field label={`New lessons this run: ${maxLessons}`}>
          <input type="range" min={1} max={4} value={maxLessons} onChange={(e) => setMaxLessons(Number(e.target.value))} className="w-full" />
        </Field>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={running || !sectionId}>{running ? "Running…" : "Run agent"}</button>
          {running && <button type="button" className="btn-ghost" onClick={() => abortRef.current?.abort()}>Stop</button>}
        </div>
      </form>

      <div className="card min-h-64 p-4">
        <h2 className="mb-3 font-semibold">Activity</h2>
        {events.length === 0 && !running && <p className="text-sm text-muted">Nothing yet. Pick a section and run the agent.</p>}
        <ol className="space-y-1.5 font-mono text-xs">
          {events.map((e, i) => (
            <li key={i} className={e.type === "error" ? "text-bad" : e.type === "warning" ? "text-warn" : e.type.endsWith("saved") ? "text-ok" : ""}>
              {describe(e)}
            </li>
          ))}
          {running && <li className="animate-pulse text-muted">…working</li>}
        </ol>
        {done && (
          <div className="mt-4 flex gap-2">
            <Link href={`/section/${sectionId}`} className="btn-primary">Open the section</Link>
            <Link href={`/quiz/${sectionId}`} className="btn-ghost">Quiz</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function describe(e: CollectorEvent): string {
  switch (e.type) {
    case "search": return `🔎 search: ${e.query}`;
    case "fetch": return `📄 read: ${e.url}`;
    case "thinking": return `💭 ${e.text.replace(/\s+/g, " ").slice(0, 220)}`;
    case "lesson_saved": return `✅ lesson saved: ${e.title}`;
    case "quiz_saved": return `✅ ${e.count} quiz question(s) saved`;
    case "done": return `🏁 finished: ${e.lessonsSaved} lesson(s), ${e.questionsSaved} question(s)`;
    case "warning": return `⚠️ ${e.message}`;
    case "error": return `❌ ${e.message}`;
    default: return e.message;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
