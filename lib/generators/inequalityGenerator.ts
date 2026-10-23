import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Linear inequality (FOS11 LB1): find the boundary point where mx + t
// changes sign. t is built from a chosen boundary x so the answer is exact.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const m = rng.pick([-3, -2, -1, 1, 2, 3] as const);
  const xBoundary = rng.int(-6, 6);
  const t = -m * xBoundary;
  const op = rng.next() < 0.5 ? ">" : "<";
  const term = `${m}x ${t >= 0 ? "+" : "-"} ${Math.abs(t)}`;

  return {
    question: {
      format: "numeric",
      prompt: `Löse die Ungleichung: ${term} ${op} 0. Bei welchem x-Wert liegt der Randpunkt (Vorzeichenwechsel)?`,
    },
    answer: { value: xBoundary },
    solutionSteps: [
      { label: "Randpunkt-Gleichung", expression: `${term} = 0` },
      { label: "Auflösen", expression: `x = ${xBoundary}` },
    ],
  };
}
