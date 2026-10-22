"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getNextExercise, submitAttempt, type NextExercisePayload, type SubmitAttemptResult } from "@/actions/exercises";
import type { GeneratedAnswer } from "@/lib/generators";
import { ExerciseQuestion, type AnswerDraft } from "./ExerciseQuestion";
import { WorkedSolutionPanel } from "./WorkedSolutionPanel";
import { MasterySignalToast } from "./MasterySignalToast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

type Status = "loading" | "active" | "submitting" | "feedback" | "mastered" | "error";

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

export function ExerciseRunner({ topicSlug, topicTitle, topicHref }: { topicSlug: string; topicTitle: string; topicHref: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [exercise, setExercise] = useState<NextExercisePayload | null>(null);
  const [draft, setDraft] = useState<AnswerDraft>({});
  const [feedback, setFeedback] = useState<SubmitAttemptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  async function loadNext() {
    setStatus("loading");
    setFeedback(null);
    setDraft({});
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

  if (status === "error") {
    return <p className="text-center text-destructive">{errorMessage}</p>;
  }

  if (status === "mastered" && feedback) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-semibold">🎉 Thema gemeistert!</h2>
        <p className="text-muted-foreground">
          Du beherrschst „{topicTitle}“ jetzt richtig gut. Mastery-Score: {Math.round(feedback.masteryScore)}/100
        </p>
        <WorkedSolutionPanel steps={feedback.solutionSteps} />
        <Button render={<Link href={topicHref}>Zurück zum Thema</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{topicTitle} – Übung</h1>
        {exercise && (
          <>
            <Progress value={exercise.masteryScore} className="mt-3" />
            <p className="mt-1 text-xs text-muted-foreground">
              Stufe {exercise.difficultyTier} von 5 · Fortschritt {Math.round(exercise.masteryScore)}/100
            </p>
          </>
        )}
      </div>

      {status === "loading" || status === "submitting" ? (
        <p className="text-center text-muted-foreground">Lädt…</p>
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
          {feedback.needsWorkedExamples && <MasterySignalToast />}
          <div className="flex justify-center gap-3">
            <Button variant="outline" render={<Link href={topicHref}>Beenden</Link>} />
            <Button onClick={loadNext}>Nächste Übung</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
