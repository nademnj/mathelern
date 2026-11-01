import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Evaluating a linear term a·x + b for a given x -- tier controls the
// coefficients' size and, at higher tiers, allows a negative x.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCoef = [8, 10, 12, 15, 20][Math.min(difficultyTier, 5) - 1];
  const a = rng.int(2, maxCoef);
  const b = rng.int(0, maxCoef);
  const x = difficultyTier >= 3 ? rng.int(-6, 6) || 1 : rng.int(1, 8);
  const result = a * x + b;

  const xDisplay = x < 0 ? `(${x})` : `${x}`;
  const termStr = b === 0 ? `${a}x` : `${a}x + ${b}`;

  return {
    question: { format: "numeric", prompt: `Berechne den Wert des Terms ${termStr} für x = ${x}.` },
    answer: { value: result },
    solutionSteps: [
      { label: "Term", expression: termStr },
      { label: "x einsetzen", expression: `${a} · ${xDisplay}${b !== 0 ? ` + ${b}` : ""}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
