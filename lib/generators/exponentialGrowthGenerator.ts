import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Exponential growth (M10 LB2). Uses an integer growth FACTOR rather than a
// percentage rate, so the result stays an exact integer at every tier
// instead of needing rounding (the lesson/real-life framing still mentions
// Zinseszins as a percentage-based cousin of this).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const start = rng.int(2, 5) * 10;
  const factor = rng.pick([2, 3] as const);
  const periods = Math.min(1 + Math.ceil(difficultyTier / 2), 4);
  const result = start * factor ** periods;

  return {
    question: {
      format: "numeric",
      prompt: `Eine Bakterienkultur mit ${start} Bakterien wächst jede Stunde um den Faktor ${factor}. Wie viele Bakterien sind es nach ${periods} Stunden?`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Startwert", expression: `${start}` },
      { label: "Wachstumsformel", expression: "W(n) = Start · Faktor^n" },
      { label: "Einsetzen", expression: `W(${periods}) = ${start} · ${factor}^${periods}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
