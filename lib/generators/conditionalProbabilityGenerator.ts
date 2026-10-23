import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Conditional probability (FOS11 LB4): P(A|B) = |A ∩ B| / |B|, as a
// simplified fraction.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const total = rng.int(10, 20 + difficultyTier);
  const bCount = rng.int(3, total - 1);
  const abCount = rng.int(1, bCount);
  const g = gcd(abCount, bCount);

  return {
    question: {
      format: "fraction",
      prompt: `In einer Gruppe von ${total} Personen gilt: |B| = ${bCount}, |A ∩ B| = ${abCount}. Wie groß ist P(A | B)? (Als gekürzter Bruch)`,
    },
    answer: { numerator: abCount / g, denominator: bCount / g },
    solutionSteps: [
      { label: "Formel", expression: "P(A|B) = |A ∩ B| / |B|" },
      { label: "Einsetzen", expression: `${abCount} / ${bCount}` },
      { label: "Gekürzt", expression: `${abCount / g}/${bCount / g}` },
    ],
  };
}
