import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Logarithm as "which exponent gives this value" (M10 LB1). Base/value kept
// to perfect powers so the answer is always a clean integer exponent.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const base = rng.pick([2, 3, 5] as const);
  const maxExp = Math.min(2 + difficultyTier, 6);
  const n = rng.int(1, maxExp);
  const value = base ** n;

  return {
    question: { format: "numeric", prompt: `Für welchen Exponenten n gilt: ${base}^n = ${value}?` },
    answer: { value: n },
    solutionSteps: [
      { label: "Frage", expression: `${base}^n = ${value}` },
      { label: "Logarithmus", expression: `n = log_${base}(${value})` },
      { label: "Ergebnis", expression: `n = ${n}` },
    ],
  };
}
