"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ChatRequest {
  /** Changes every time a new request is made, so the same text can be asked twice. */
  id: number;
  text: string;
  focus?: string;
}

export interface QuizContext {
  questionDe: string;
  options: string[];
  correct: number[];
  explanationDe: string;
  answered: boolean;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarise this lesson in 5 bullet points",
  "Which facts here are most likely to come up in the exam?",
  "Give me a memory hook (Eselsbrücke) for this",
];

export function ChatPanel({
  sectionId,
  lessonId,
  quiz,
  request,
  title = "Tutor",
}: {
  sectionId: string;
  lessonId?: string;
  quiz?: QuizContext;
  request?: ChatRequest | null;
  title?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastRequest = useRef<number | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string, focus?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const history: Msg[] = [...messagesRef.current, { role: "user", content: trimmed }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20).filter((m) => m.content), sectionId, lessonId, quizQuestion: quiz, focusParagraph: focus }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "");
        throw new Error(err || `Error ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const text = navigator.onLine ? (err as Error).message : "You're offline. The tutor needs an internet connection; lessons and quizzes still work.";
      setMessages([...history, { role: "assistant", content: `⚠️ ${text}` }]);
    } finally {
      if (abortRef.current === controller) setBusy(false);
    }
  };

  useEffect(() => {
    if (request && request.id !== lastRequest.current) {
      lastRequest.current = request.id;
      void send(request.text, request.focus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <div className="card flex h-[32rem] flex-col lg:h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold">💬 {title}</h2>
        {messages.length > 0 && (
          <button className="text-xs text-muted hover:text-text" onClick={() => { abortRef.current?.abort(); setMessages([]); setBusy(false); }}>
            Clear
          </button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <div className="space-y-3 text-muted">
            <p>Ask anything about this material, in English or German. The tutor sees the text you are reading.</p>
            <div className="flex flex-col gap-2">
              {(quiz ? ["Give me a hint", "Why is this the right answer?", "Explain the German wording of the question"] : SUGGESTIONS).map((s) => (
                <button key={s} className="rounded-lg border border-border px-3 py-2 text-left hover:bg-surface-2" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "ml-8 rounded-lg bg-accent-soft px-3 py-2" : "mr-2 space-y-2 leading-relaxed"}
          >
            {m.role === "assistant" && !m.content && busy ? <span className="text-muted">Thinking…</span> : <Markdown text={m.content} />}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the tutor…"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button className="btn-primary" disabled={busy || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

/** Minimal, safe Markdown: paragraphs, bullet/numbered lists, **bold**, *italic*. */
function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const items = lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>);
          return ordered ? <ol key={bi} className="list-decimal space-y-1 pl-5">{items}</ol> : <ul key={bi} className="list-disc space-y-1 pl-5">{items}</ul>;
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""))}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
