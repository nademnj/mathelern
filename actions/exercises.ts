"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatorRegistry, isAnswerCorrect, type GeneratedAnswer } from "@/lib/generators";
import {
  applyAttempt,
  defaultMasteryState,
  type MasteryState,
} from "@/lib/adaptive/masteryModel";
import { selectNextDifficulty } from "@/lib/adaptive/selectNextDifficulty";
import { computeMasterySignal, REMEDIAL_ROUND_CAP } from "@/lib/adaptive/masterySignals";
import { STRUGGLING_THRESHOLD } from "@/lib/adaptive/masteryModel";
import { checkAndAwardMilestones } from "@/lib/milestones/checkMilestones";
import { generateExamStyleExercise } from "@/lib/chat/exerciseGenerator";

function toMasteryState(row: {
  mastery_score: number;
  consecutive_correct: number;
  consecutive_incorrect: number;
  last_difficulty_tier: number;
  status: MasteryState["status"];
}): MasteryState {
  return {
    masteryScore: row.mastery_score,
    consecutiveCorrect: row.consecutive_correct,
    consecutiveIncorrect: row.consecutive_incorrect,
    lastDifficultyTier: row.last_difficulty_tier,
    status: row.status,
  };
}

export interface NextExercisePayload {
  exerciseInstanceId: string;
  question: { prompt: string; format: "numeric" | "fraction" | "text" };
  difficultyTier: number;
  isRemedial: boolean;
  masteryScore: number;
  masteryStatus: MasteryState["status"];
}

export async function getNextExercise(
  topicSlug: string
): Promise<NextExercisePayload | { error: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };
  const studentId = auth.user.id;

  const admin = createAdminClient();

  const { data: topic } = await admin
    .from("topics")
    .select("id, generator_key, is_published")
    .eq("slug", topicSlug)
    .single();
  if (!topic || !topic.is_published) return { error: "Thema nicht gefunden." };
  if (!topic.generator_key) return { error: "Für dieses Thema sind noch keine Übungen verfügbar." };

  const generatorFn = generatorRegistry[topic.generator_key];
  if (!generatorFn) return { error: "Unbekannter Übungsgenerator." };

  const { data: masteryRow } = await admin
    .from("topic_mastery")
    .select("*")
    .eq("student_id", studentId)
    .eq("topic_id", topic.id)
    .maybeSingle();
  const masteryState = masteryRow ? toMasteryState(masteryRow) : null;

  const difficultyTier = selectNextDifficulty(masteryState);
  const isRemedial = masteryState ? computeMasterySignal(masteryState).needsWorkedExamples : false;

  const { data: exerciseDef } = await admin
    .from("exercises")
    .select("id")
    .eq("topic_id", topic.id)
    .eq("difficulty_tier", difficultyTier)
    .eq("generator_key", topic.generator_key)
    .eq("mode", "generated")
    .maybeSingle();
  if (!exerciseDef) return { error: "Keine Übung für diesen Schwierigkeitsgrad gefunden." };

  const seed = Math.floor(Math.random() * 2 ** 31);
  const exercise = generatorFn({ difficultyTier, seed });

  const { data: instance, error: instanceError } = await admin
    .from("exercise_instances")
    .insert({
      exercise_id: exerciseDef.id,
      student_id: studentId,
      seed,
      rendered_question: exercise.question,
    })
    .select("id")
    .single();
  if (instanceError || !instance) return { error: instanceError?.message ?? "Übung konnte nicht erstellt werden." };

  const { error: answerError } = await admin.from("exercise_instance_answers").insert({
    exercise_instance_id: instance.id,
    rendered_answer: exercise.answer,
    solution_steps: exercise.solutionSteps,
  });
  if (answerError) return { error: answerError.message };

  return {
    exerciseInstanceId: instance.id,
    question: exercise.question,
    difficultyTier,
    isRemedial,
    masteryScore: masteryState?.masteryScore ?? 0,
    masteryStatus: masteryState?.status ?? "not_started",
  };
}

/**
 * Exam-prep mode: instead of the deterministic PRNG generator, an AI-authored
 * exercise is created fresh in the real Bavarian Schulaufgabe style, at the
 * same difficulty tier the adaptive ladder would pick next -- so it starts
 * easy and climbs exactly like regular practice, just exam-flavored. It is
 * persisted through the normal exercises/exercise_instances tables so
 * submitAttempt() and the mastery ladder need no changes at all.
 */
export async function generateAiExercise(
  topicSlug: string
): Promise<NextExercisePayload | { error: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };
  const studentId = auth.user.id;

  const admin = createAdminClient();

  const { data: topic } = await admin
    .from("topics")
    .select("id, title, lehrplan_ref, is_published")
    .eq("slug", topicSlug)
    .single();
  if (!topic || !topic.is_published) return { error: "Thema nicht gefunden." };

  const { data: masteryRow } = await admin
    .from("topic_mastery")
    .select("*")
    .eq("student_id", studentId)
    .eq("topic_id", topic.id)
    .maybeSingle();
  const masteryState = masteryRow ? toMasteryState(masteryRow) : null;
  const difficultyTier = selectNextDifficulty(masteryState);
  const isRemedial = masteryState ? computeMasterySignal(masteryState).needsWorkedExamples : false;

  const { data: topicExerciseRows } = await admin.from("exercises").select("id").eq("topic_id", topic.id);
  const topicExerciseIds = (topicExerciseRows ?? []).map((r) => r.id);
  const { data: recentRows } =
    topicExerciseIds.length > 0
      ? await admin
          .from("exercise_instances")
          .select("rendered_question")
          .eq("student_id", studentId)
          .in("exercise_id", topicExerciseIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] as { rendered_question: unknown }[] };
  const avoidPrompts = (recentRows ?? []).map((r) => (r.rendered_question as { prompt: string }).prompt);

  let exercise;
  try {
    exercise = await generateExamStyleExercise({
      topicTitle: topic.title,
      lehrplanRef: topic.lehrplan_ref ?? topic.title,
      difficultyTier,
      avoidPrompts,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Die Prüfungsaufgabe konnte nicht erstellt werden." };
  }

  const { data: exerciseDef, error: exerciseError } = await admin
    .from("exercises")
    .insert({
      topic_id: topic.id,
      mode: "static",
      difficulty_tier: difficultyTier,
      static_payload: exercise.question,
      solution_script: exercise.solutionSteps,
      tags: ["ai_generated", "exam_style"],
    })
    .select("id")
    .single();
  if (exerciseError || !exerciseDef) return { error: exerciseError?.message ?? "Übung konnte nicht erstellt werden." };

  const seed = Math.floor(Math.random() * 2 ** 31);
  const { data: instance, error: instanceError } = await admin
    .from("exercise_instances")
    .insert({
      exercise_id: exerciseDef.id,
      student_id: studentId,
      seed,
      rendered_question: exercise.question,
    })
    .select("id")
    .single();
  if (instanceError || !instance) return { error: instanceError?.message ?? "Übung konnte nicht erstellt werden." };

  const { error: answerError } = await admin.from("exercise_instance_answers").insert({
    exercise_instance_id: instance.id,
    rendered_answer: exercise.answer,
    solution_steps: exercise.solutionSteps,
  });
  if (answerError) return { error: answerError.message };

  return {
    exerciseInstanceId: instance.id,
    question: exercise.question,
    difficultyTier,
    isRemedial,
    masteryScore: masteryState?.masteryScore ?? 0,
    masteryStatus: masteryState?.status ?? "not_started",
  };
}

export interface SubmitAttemptResult {
  isCorrect: boolean;
  solutionSteps: { label: string; expression: string }[];
  masteryScore: number;
  masteryStatus: MasteryState["status"];
  difficultyTier: number;
  needsWorkedExamples: boolean;
}

export async function submitAttempt(
  exerciseInstanceId: string,
  submittedAnswer: GeneratedAnswer,
  options: { hintUsed: boolean; timeSpentMs: number; attemptNumber: number }
): Promise<SubmitAttemptResult | { error: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };
  const studentId = auth.user.id;

  const admin = createAdminClient();

  const { data: instance } = await admin
    .from("exercise_instances")
    .select("id, exercise_id, student_id")
    .eq("id", exerciseInstanceId)
    .eq("student_id", studentId) // never trust a client-passed studentId
    .single();
  if (!instance) return { error: "Übung nicht gefunden." };

  const { data: answerRow } = await admin
    .from("exercise_instance_answers")
    .select("rendered_answer, solution_steps")
    .eq("exercise_instance_id", instance.id)
    .single();
  if (!answerRow) return { error: "Antwort nicht gefunden." };

  const { data: exerciseDef } = await admin
    .from("exercises")
    .select("topic_id, difficulty_tier, generator_key")
    .eq("id", instance.exercise_id)
    .single();
  if (!exerciseDef) return { error: "Übung nicht gefunden." };

  const expected = answerRow.rendered_answer as GeneratedAnswer;
  const isCorrect = isAnswerCorrect(submittedAnswer, expected);

  await admin.from("exercise_attempts").insert({
    exercise_instance_id: instance.id,
    student_id: studentId,
    submitted_answer: submittedAnswer,
    is_correct: isCorrect,
    time_spent_ms: options.timeSpentMs,
    hint_used: options.hintUsed,
    attempt_number: options.attemptNumber,
  });

  const { data: masteryRow } = await admin
    .from("topic_mastery")
    .select("*")
    .eq("student_id", studentId)
    .eq("topic_id", exerciseDef.topic_id)
    .maybeSingle();

  const currentState = masteryRow ? toMasteryState(masteryRow) : defaultMasteryState();
  // The exercise was served at exerciseDef.difficulty_tier; make sure the
  // ladder operates on that tier even if mastery drifted between fetch and submit.
  currentState.lastDifficultyTier = exerciseDef.difficulty_tier;

  const nextState = applyAttempt(currentState, {
    isCorrect,
    firstTry: options.attemptNumber === 1 && !options.hintUsed,
  });

  await admin.from("topic_mastery").upsert(
    {
      student_id: studentId,
      topic_id: exerciseDef.topic_id,
      mastery_score: nextState.masteryScore,
      consecutive_correct: nextState.consecutiveCorrect,
      consecutive_incorrect: nextState.consecutiveIncorrect,
      last_difficulty_tier: nextState.lastDifficultyTier,
      status: nextState.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,topic_id" }
  );

  const { data: topicRow } = await admin.from("topics").select("grade_id").eq("id", exerciseDef.topic_id).single();
  if (topicRow) await checkAndAwardMilestones(studentId, topicRow.grade_id);

  // Escalate to a parent recommendation once remedial rounds run out without recovery.
  if (
    nextState.status === "struggling" &&
    nextState.consecutiveIncorrect >= STRUGGLING_THRESHOLD + REMEDIAL_ROUND_CAP
  ) {
    const { data: existing } = await admin
      .from("parent_recommendations")
      .select("id")
      .eq("student_id", studentId)
      .eq("topic_id", exerciseDef.topic_id)
      .eq("severity", "priority")
      .is("dismissed_at", null)
      .maybeSingle();

    if (!existing) {
      await admin.from("parent_recommendations").insert({
        student_id: studentId,
        topic_id: exerciseDef.topic_id,
        severity: "priority",
        message:
          "Dein Kind hat bei diesem Thema mehrfach hintereinander Schwierigkeiten. Eine gemeinsame Wiederholung (ca. 15 Min.) könnte helfen.",
        suggested_action: { type: "review_topic", topicId: exerciseDef.topic_id },
      });
    }
  }

  const signal = computeMasterySignal(nextState);

  return {
    isCorrect,
    solutionSteps: (answerRow.solution_steps as { label: string; expression: string }[]) ?? [],
    masteryScore: nextState.masteryScore,
    masteryStatus: nextState.status,
    difficultyTier: nextState.lastDifficultyTier,
    needsWorkedExamples: signal.needsWorkedExamples,
  };
}
