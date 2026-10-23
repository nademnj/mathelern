import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const NAMES = ["Anna", "Ben", "Clara", "David", "Emma", "Felix", "Greta"];

// Permutations (M10 LB6): n! for a small group of named people, n capped at
// 7 (5040) so the result stays a manageable integer.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const n = Math.min(2 + Math.floor(difficultyTier * 0.8), 7);
  const names = NAMES.slice(0, n);

  let factorial = 1;
  for (let i = 2; i <= n; i++) factorial *= i;

  const factorString = Array.from({ length: n }, (_, i) => n - i).join(" · ");

  return {
    question: {
      format: "numeric",
      prompt: `Auf wie viele Arten können ${n} Personen (${names.join(", ")}) in einer Reihe aufgestellt werden?`,
    },
    answer: { value: factorial },
    solutionSteps: [
      { label: "Permutationsformel", expression: "Anzahl = n!" },
      { label: "Einsetzen", expression: `${n}! = ${factorString}` },
      { label: "Ergebnis", expression: `${factorial}` },
    ],
  };
}
