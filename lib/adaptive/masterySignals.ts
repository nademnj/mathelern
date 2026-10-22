import type { MasteryState } from "./masteryModel";

export interface MasterySignal {
  needsWorkedExamples: boolean;
  remedialTier: number;
}

/** Flipping to "struggling" means: show the worked solution, then serve
 * remedial exercises one tier down until the student recovers. */
export function computeMasterySignal(state: MasteryState): MasterySignal {
  return {
    needsWorkedExamples: state.status === "struggling",
    remedialTier: Math.max(1, state.lastDifficultyTier - 1),
  };
}

export const REMEDIAL_ROUND_CAP = 5;
