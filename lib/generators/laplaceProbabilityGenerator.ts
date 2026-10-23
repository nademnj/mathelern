import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Laplace probability (FOS11 LB4): P = günstige / mögliche, as a simplified
// fraction.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const total = rng.int(6, 12 + difficultyTier);
  const favorable = rng.int(1, total - 1);
  const g = gcd(favorable, total);

  return {
    question: {
      format: "fraction",
      prompt: `Eine Laplace-Urne enthält ${total} Kugeln, davon sind ${favorable} günstig. Wie groß ist die Wahrscheinlichkeit, eine günstige Kugel zu ziehen? (Als gekürzter Bruch)`,
    },
    answer: { numerator: favorable / g, denominator: total / g },
    solutionSteps: [
      { label: "Laplace-Formel", expression: "P = günstige / mögliche" },
      { label: "Einsetzen", expression: `${favorable} / ${total}` },
      { label: "Gekürzt", expression: `${favorable / g}/${total / g}` },
    ],
  };
}
