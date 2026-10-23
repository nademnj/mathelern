import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Sample space size (FOS11 LB3): rolling a die n times, |Ω| = 6^n.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const n = Math.min(1 + Math.ceil(difficultyTier / 2), 3);
  const result = 6 ** n;

  return {
    question: { format: "numeric", prompt: `Du würfelst ${n}-mal mit einem normalen Würfel. Wie viele Elemente hat der Ergebnisraum Ω?` },
    answer: { value: result },
    solutionSteps: [
      { label: "Pro Wurf", expression: "6 Möglichkeiten" },
      { label: "Zählprinzip", expression: `6^${n}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
