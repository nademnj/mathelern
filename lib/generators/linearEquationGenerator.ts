import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Solving ax + b = c for x -- tier controls the coefficient size and, at
// higher tiers, allows a negative solution.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCoef = [6, 8, 10, 12, 15][Math.min(difficultyTier, 5) - 1];
  const a = rng.int(2, maxCoef);
  const x = difficultyTier >= 3 ? rng.int(-10, 10) || 1 : rng.int(1, 10);
  const b = rng.int(-maxCoef, maxCoef);
  const c = a * x + b;

  const bDisplay = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

  return {
    question: { format: "numeric", prompt: `Löse die Gleichung nach x auf: ${a}x ${bDisplay} = ${c}` },
    answer: { value: x },
    solutionSteps: [
      { label: "Gleichung", expression: `${a}x ${bDisplay} = ${c}` },
      { label: `${b >= 0 ? "Subtrahiere" : "Addiere"} ${Math.abs(b)}`, expression: `${a}x = ${c - b}` },
      { label: `Teile durch ${a}`, expression: `x = ${c - b} / ${a}` },
      { label: "Ergebnis", expression: `x = ${x}` },
    ],
  };
}
