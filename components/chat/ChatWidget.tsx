"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getChatHistory, sendChatMessage, type ChatMessageRow } from "@/actions/chat";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentLesson } from "@/lib/chat/CurrentLessonContext";
import { speakGerman } from "@/lib/chat/speak";

export function ChatWidget() {
  const pathname = usePathname();
  const { currentLesson } = useCurrentLesson();
  // Only /topic/:slug and /exercise/:slug carry the topic slug directly in
  // the URL -- good enough context for "what is the student looking at"
  // on those pages. On a lesson page, currentLesson (set by LessonPlayer)
  // carries the richer lesson+step context instead.
  const topicSlug = useMemo(() => {
    const match = pathname.match(/^\/(topic|exercise)\/([^/]+)/);
    return match ? match[2] : null;
  }, [pathname]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !loaded) {
      getChatHistory().then((result) => {
        if (!("error" in result)) setMessages(result);
        setLoaded(true);
      });
    }
  }, [isOpen, loaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setError(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        role: "student",
        content: text,
        generatedTitle: null,
        generatedSteps: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    setPending(true);
    const result = await sendChatMessage(
      text,
      topicSlug,
      currentLesson
        ? { lessonId: currentLesson.lessonId, currentStepIndex: currentLesson.currentStepIndex }
        : null
    );
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setMessages((prev) => [...prev, result.assistantMessage]);
    if (voiceOn) speakGerman(result.assistantMessage.content);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label={isOpen ? "Mathe-Tutor schließen" : "Mathe-Tutor öffnen"}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="fixed right-5 bottom-24 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-border bg-card shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Mathe-Tutor</span>
              <button
                onClick={() => {
                  setVoiceOn((v) => !v);
                  if (voiceOn) window.speechSynthesis?.cancel();
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label={voiceOn ? "Sprachausgabe stummschalten" : "Sprachausgabe einschalten"}
                title={voiceOn ? "Sprachausgabe stummschalten" : "Sprachausgabe einschalten"}
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>
            </div>
            {currentLesson && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                📍 sieht gerade: {currentLesson.lessonTitle} (Schritt {currentLesson.currentStepIndex + 1})
              </p>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {loaded && messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Frag mich etwas zu deiner aktuellen Aufgabe!
              </p>
            )}
            {messages.map((m) => (
              <ChatMessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                generatedTitle={m.generatedTitle}
                generatedSteps={m.generatedSteps}
              />
            ))}
            {pending && <p className="text-xs text-muted-foreground">Tutor tippt…</p>}
            <div ref={bottomRef} />
          </div>

          {error && <p className="px-4 pb-1 text-xs text-destructive">{error}</p>}

          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Frag etwas…"
              disabled={pending}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSend} disabled={pending || !input.trim()}>
              Senden
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
