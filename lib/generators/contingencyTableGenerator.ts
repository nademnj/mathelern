import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Vierfeldertafel / contingency table (FOS11 LB4): row total from its two
// cells -- the simplest read of a four-field table, exact by construction.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCount = 5 + difficultyTier * 2;
  const ab = rng.int(5, maxCount);
  const aNotB = rng.int(5, maxCount);
  const totalA = ab + aNotB;

  return {
    question: {
      format: "numeric",
      prompt: `Vierfeldertafel: |A ∩ B| = ${ab}, |A ∩ B̄| = ${aNotB}. Wie groß ist |A| (Zeilensumme)?`,
    },
    answer: { value: totalA },
    solutionSteps: [
      { label: "Zeilensumme", expression: "|A| = |A ∩ B| + |A ∩ B̄|" },
      { label: "Einsetzen", expression: `${ab} + ${aNotB}` },
      { label: "Ergebnis", expression: `${totalA}` },
    ],
  };
}
