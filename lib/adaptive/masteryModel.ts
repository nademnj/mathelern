import type { TopicMasteryStatus } from "@/lib/types/db";

export interface MasteryState {
  masteryScore: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  lastDifficultyTier: number;
  status: TopicMasteryStatus;
}

export interface AttemptResult {
  isCorrect: boolean;
  /** True if correct on the first try, with no hint used. */
  firstTry: boolean;
}

export const MASTERY_SCORE_THRESHOLD = 80;
export const MASTERED_MIN_TIER = 4;
export const STRUGGLING_THRESHOLD = 3;
export const TIER_CLIMB_STREAK = 2;
export const TIER_DROP_STREAK = 2;
export const MIN_TIER = 1;
export const MAX_TIER = 5;

export function defaultMasteryState(): MasteryState {
  return {
    masteryScore: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    lastDifficultyTier: MIN_TIER,
    status: "not_started",
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeStatus(masteryScore: number, tier: number, consecutiveIncorrect: number): TopicMasteryStatus {
  if (masteryScore >= MASTERY_SCORE_THRESHOLD && tier >= MASTERED_MIN_TIER) return "mastered";
  if (consecutiveIncorrect >= STRUGGLING_THRESHOLD) return "struggling";
  return "in_progress";
}

/**
 * Applies one exercise attempt to the current mastery state and returns the
 * next state. Pure function — no I/O, fully unit-testable.
 *
 * Scoring: correct-first-try at tier T: +(4 + T*2); correct after
 * retry/hint: +(2 + T); incorrect: -3 (floored at 0).
 * Tier: 2 consecutive correct -> tier+1 (cap 5); the correct-streak counter
 * then resets. consecutive_incorrect is NOT reset by a tier drop — it keeps
 * counting wrong answers in a row, since "struggling" (>=3 in a row) is a
 * signal independent of how many times the tier has already stepped down.
 */
export function applyAttempt(state: MasteryState, attempt: AttemptResult): MasteryState {
  const tier = state.lastDifficultyTier;

  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveIncorrect = state.consecutiveIncorrect;
  let scoreDelta: number;

  if (attempt.isCorrect) {
    scoreDelta = attempt.firstTry ? 4 + tier * 2 : 2 + tier;
    consecutiveCorrect += 1;
    consecutiveIncorrect = 0;
  } else {
    scoreDelta = -3;
    consecutiveIncorrect += 1;
    consecutiveCorrect = 0;
  }

  const masteryScore = clamp(state.masteryScore + scoreDelta, 0, 100);

  let nextTier = tier;
  if (consecutiveCorrect >= TIER_CLIMB_STREAK) {
    nextTier = Math.min(MAX_TIER, tier + 1);
    consecutiveCorrect = 0;
  } else if (consecutiveIncorrect >= TIER_DROP_STREAK) {
    nextTier = Math.max(MIN_TIER, tier - 1);
  }

  return {
    masteryScore,
    consecutiveCorrect,
    consecutiveIncorrect,
    lastDifficultyTier: nextTier,
    status: computeStatus(masteryScore, nextTier, consecutiveIncorrect),
  };
}
