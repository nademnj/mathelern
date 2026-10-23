import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Inclusion-exclusion (FOS11 LB3): |A ∪ B| = |A| + |B| - |A ∩ B|. Built from
// the three disjoint region sizes, so the answer is exact by construction.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCount = 3 + difficultyTier;
  const intersect = rng.int(1, maxCount);
  const onlyA = rng.int(1, maxCount);
  const onlyB = rng.int(1, maxCount);
  const a = onlyA + intersect;
  const b = onlyB + intersect;
  const union = onlyA + onlyB + intersect;

  return {
    question: { format: "numeric", prompt: `Gegeben: |A| = ${a}, |B| = ${b}, |A ∩ B| = ${intersect}. Wie groß ist |A ∪ B|?` },
    answer: { value: union },
    solutionSteps: [
      { label: "Formel", expression: "|A ∪ B| = |A| + |B| - |A ∩ B|" },
      { label: "Einsetzen", expression: `${a} + ${b} - ${intersect}` },
      { label: "Ergebnis", expression: `${union}` },
    ],
  };
}
