"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoryboardBeat } from "@/lib/content/lessonSchema";
import { StoryboardStepRenderer } from "@/components/lesson/StoryboardStepRenderer";
import { ScriptCaptionBar } from "@/components/lesson/ScriptCaptionBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { markLessonStarted, markLessonCompleted } from "@/actions/progress";
import { useCurrentLesson } from "@/lib/chat/CurrentLessonContext";
import { speakGerman, stopSpeaking } from "@/lib/chat/speak";

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  storyboard: StoryboardBeat[];
  script: { beatId: string; narration: string }[];
  videoUrl: string | null;
  nextHref: string;
}

export function LessonPlayer({ lessonId, title, storyboard, script, videoUrl, nextHref }: LessonPlayerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const startedAt = useRef(Date.now());
  const { setCurrentLesson } = useCurrentLesson();

  useEffect(() => {
    markLessonStarted(lessonId);
  }, [lessonId]);

  // Keep the chat widget aware of exactly which step is on screen.
  useEffect(() => {
    setCurrentLesson({ lessonId, lessonTitle: title, currentStepIndex: index });
  }, [lessonId, title, index, setCurrentLesson]);

  useEffect(() => {
    return () => {
      setCurrentLesson(null);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  const beat = storyboard[index];
  const narration = script.find((s) => s.beatId === beat.narrationRef)?.narration ?? "";
  const isLast = index === storyboard.length - 1;

  // Read each step aloud as it appears, like a teacher narrating the lesson.
  useEffect(() => {
    if (voiceOn && narration) speakGerman(narration);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the visible step/text changes
  }, [narration, index]);

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setCompleting(true);
    await markLessonCompleted(lessonId, Date.now() - startedAt.current);
    router.push(nextHref);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>
          <button
            onClick={() => {
              if (voiceOn) {
                stopSpeaking();
                setVoiceOn(false);
              } else {
                setVoiceOn(true);
                if (narration) speakGerman(narration);
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label={voiceOn ? "Vorlesen stummschalten" : "Vorlesen einschalten"}
            title={voiceOn ? "Vorlesen stummschalten" : "Vorlesen einschalten"}
          >
            {voiceOn ? "🔊" : "🔇"}
          </button>
        </div>
        <Progress value={((index + 1) / storyboard.length) * 100} className="mt-3" />
        <p className="mt-1 text-xs text-muted-foreground">
          Schritt {index + 1} von {storyboard.length}
        </p>
      </div>

      {videoUrl ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- captions come from a future transcript track once real video is authored.
        <video src={videoUrl} controls className="w-full rounded-md border border-border" />
      ) : (
        <div className="space-y-4 rounded-lg border border-border p-6">
          <StoryboardStepRenderer beat={beat} />
          <ScriptCaptionBar narration={narration} onReplay={() => speakGerman(narration)} />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={completing}>
          {isLast ? (completing ? "Wird gespeichert…" : "Lektion abschließen") : "Weiter"}
        </Button>
      </div>
    </div>
  );
}
