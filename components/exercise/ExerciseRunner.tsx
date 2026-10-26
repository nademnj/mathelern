"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getNextExercise,
  generateAiExercise,
  submitAttempt,
  explainSolution,
  type NextExercisePayload,
  type SubmitAttemptResult,
} from "@/actions/exercises";
import type { GeneratedAnswer } from "@/lib/generators";
import type { ExplainedStep } from "@/lib/chat/solutionExplainer";
import { ExerciseQuestion, type AnswerDraft } from "./ExerciseQuestion";
import { WorkedSolutionPanel } from "./WorkedSolutionPanel";
import { DetailedSolutionPanel } from "./DetailedSolutionPanel";
import { MasterySignalToast } from "./MasterySignalToast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

type Status = "loading" | "loadingAi" | "active" | "submitting" | "feedback" | "mastered" | "error";
type ExplainStatus = "idle" | "loading" | "loaded" | "error";

function draftToAnswer(format: "numeric" | "fraction" | "text", draft: AnswerDraft): GeneratedAnswer {
  if (format === "fraction") {
    return { numerator: Number(draft.numerator), denominator: Number(draft.denominator) };
  }
  if (format === "numeric") {
    return { value: Number(draft.value) };
  }
  return { text: draft.value ?? "" };
}

function isDraftComplete(format: "numeric" | "fraction" | "text", draft: AnswerDraft): boolean {
  if (format === "fraction") return draft.numerator !== undefined && draft.denominator !== undefined && draft.numerator !== "" && draft.denominator !== "";
  return draft.value !== undefined && draft.value !== "";
}

export function ExerciseRunner({
  topicSlug,
  topicTitle,
  topicHref,
  lessonHref,
  lessonSummary,
}: {
  topicSlug: string;
  topicTitle: string;
  topicHref: string;
  lessonHref: string | null;
  lessonSummary: { title: string; bullets: string[] } | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [exercise, setExercise] = useState<NextExercisePayload | null>(null);
  const [draft, setDraft] = useState<AnswerDraft>({});
  const [feedback, setFeedback] = useState<SubmitAttemptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [explainStatus, setExplainStatus] = useState<ExplainStatus>("idle");
  const [explainedSteps, setExplainedSteps] = useState<ExplainedStep[] | null>(null);
  const startedAt = useRef(Date.now());

  async function loadNext() {
    setStatus("loading");
    setFeedback(null);
    setDraft({});
    setIsExamMode(false);
    setExplainStatus("idle");
    setExplainedSteps(null);
    const result = await getNextExercise(topicSlug);
    if ("error" in result) {
      setErrorMessage(result.error);
      setStatus("error");
      return;
    }
    setExercise(result);
    startedAt.current = Date.now();
    setStatus("active");
  }

  async function loadNextAiExercise() {
    setStatus("loadingAi");
    setFeedback(null);
    setDraft({});
    setIsExamMode(true);
    setExplainStatus("idle");
    setExplainedSteps(null);
    const result = await generateAiExercise(topicSlug);
    if ("error" in result) {
      setErrorMessage(result.error);
      setStatus("error");
      return;
    }
    setExercise(result);
    startedAt.current = Date.now();
    setStatus("active");
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicSlug]);

  async function handleSubmit() {
    if (!exercise) return;
    setStatus("submitting");
    const answer = draftToAnswer(exercise.question.format, draft);
    const result = await submitAttempt(exercise.exerciseInstanceId, answer, {
      hintUsed: false,
      timeSpentMs: Date.now() - startedAt.current,
      attemptNumber: 1,
    });
    if ("error" in result) {
      setErrorMessage(result.error);
      setStatus("error");
      return;
    }
    setFeedback(result);
    setStatus(result.masteryStatus === "mastered" ? "mastered" : "feedback");
  }

  async function handleExplain() {
    if (!exercise) return;
    setExplainStatus("loading");
    const result = await explainSolution(exercise.exerciseInstanceId);
    if ("error" in result) {
      setErrorMessage(result.error);
      setExplainStatus("error");
      return;
    }
    setExplainedSteps(result.steps);
    setExplainStatus("loaded");
  }

  const topBar = (
    <div className="mb-4 flex items-center justify-between gap-2">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Zurück
      </button>
      {lessonHref && (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={lessonHref}>📖 Zur Lektion</Link>} />
      )}
    </div>
  );

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md">
        {topBar}
        <p className="text-center text-destructive">{errorMessage}</p>
      </div>
    );
  }

  if (status === "mastered" && feedback) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        {topBar}
        <h2 className="text-2xl font-semibold">🎉 Thema gemeistert!</h2>
        <p className="text-muted-foreground">
          Du beherrschst „{topicTitle}“ jetzt richtig gut. Mastery-Score: {Math.round(feedback.masteryScore)}/100
        </p>
        <WorkedSolutionPanel steps={feedback.solutionSteps} />
        <Button nativeButton={false} render={<Link href={topicHref}>Zurück zum Thema</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        {topBar}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold">{topicTitle} – Übung</h1>
            {isExamMode && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                📝 Prüfungsmodus
              </span>
            )}
          </div>
          {exercise && (
            <>
              <Progress value={exercise.masteryScore} className="mt-3" />
              <p className="mt-1 text-xs text-muted-foreground">
                Stufe {exercise.difficultyTier} von 5 · Fortschritt {Math.round(exercise.masteryScore)}/100
              </p>
            </>
          )}
          {(status === "active" || status === "submitting") && (
            <button
              onClick={loadNextAiExercise}
              className="mt-2 text-xs text-primary underline hover:no-underline"
            >
              📝 Prüfungsaufgabe generieren (KI, steigende Schwierigkeit)
            </button>
          )}
        </div>

        {status === "loading" || status === "submitting" ? (
          <p className="text-center text-muted-foreground">Lädt…</p>
        ) : status === "loadingAi" ? (
          <p className="text-center text-muted-foreground">
            📝 KI erstellt eine Prüfungsaufgabe im Stil einer echten Schulaufgabe…
          </p>
        ) : exercise && status === "active" ? (
          <Card>
            <CardContent className="pt-6">
              <ExerciseQuestion
                prompt={exercise.question.prompt}
                format={exercise.question.format}
                draft={draft}
                onChange={setDraft}
              />
              <div className="mt-6 flex justify-center">
                <Button onClick={handleSubmit} disabled={!isDraftComplete(exercise.question.format, draft)}>
                  Antwort prüfen
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : exercise && feedback && status === "feedback" ? (
          <div className="space-y-4">
            <p
              className={`text-center text-lg font-medium ${feedback.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
            >
              {feedback.isCorrect ? "Richtig! 🎉" : "Noch nicht ganz richtig."}
            </p>
            <WorkedSolutionPanel steps={feedback.solutionSteps} />

            {explainStatus === "idle" && (
              <div className="text-center">
                <button
                  onClick={handleExplain}
                  className="text-xs text-primary underline hover:no-underline"
                >
                  📋 Ergebnis zeigen: Schritt für Schritt erklärt (KI)
                </button>
              </div>
            )}
            {explainStatus === "loading" && (
              <p className="text-center text-xs text-muted-foreground">KI erklärt jeden Schritt…</p>
            )}
            {explainStatus === "loaded" && explainedSteps && <DetailedSolutionPanel steps={explainedSteps} />}

            {feedback.needsWorkedExamples && <MasterySignalToast />}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" nativeButton={false} render={<Link href={topicHref}>Beenden</Link>} />
              <Button variant="outline" onClick={loadNext}>
                Nächste Übung
              </Button>
              <Button onClick={loadNextAiExercise}>📝 Nächste Prüfungsaufgabe</Button>
            </div>
          </div>
        ) : null}
      </div>

      {lessonSummary && (
        <aside className="mt-8 lg:mt-14">
          <Card>
            <CardContent className="space-y-2 pt-6">
              <p className="text-xs font-semibold uppercase text-muted-foreground">📘 Lektion zur Erinnerung</p>
              <p className="text-sm font-medium">{lessonSummary.title}</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {lessonSummary.bullets.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
              {lessonHref && (
                <Link href={lessonHref} className="inline-block pt-1 text-xs text-primary underline hover:no-underline">
                  Lektion nochmal ansehen
                </Link>
              )}
            </CardContent>
          </Card>
        </aside>
      )}
    </div>
  );
}
