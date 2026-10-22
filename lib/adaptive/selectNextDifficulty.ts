import type { MasteryState } from "./masteryModel";
import { computeMasterySignal } from "./masterySignals";

/** Which difficulty tier the next exercise should use, given the student's
 * current mastery state for this topic (null = no attempts yet -> tier 1). */
export function selectNextDifficulty(state: MasteryState | null): number {
  if (!state) return 1;
  const signal = computeMasterySignal(state);
  if (signal.needsWorkedExamples) return signal.remedialTier;
  return state.lastDifficultyTier;
}
