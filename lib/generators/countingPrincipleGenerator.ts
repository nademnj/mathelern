import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const SCENARIOS = [
  ["Hemden", "Hosen"],
  ["Vorspeisen", "Hauptgerichte"],
  ["Farben", "Größen"],
] as const;

// Zählprinzip / multiplication principle (FOS11 LB5): independent choice
// counts multiply.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const [cat1, cat2] = rng.pick(SCENARIOS);
  const n1 = rng.int(2, 3 + difficultyTier);
  const n2 = rng.int(2, 3 + difficultyTier);
  const result = n1 * n2;

  return {
    question: { format: "numeric", prompt: `Du kannst aus ${n1} ${cat1} und ${n2} ${cat2} wählen. Wie viele Kombinationen gibt es?` },
    answer: { value: result },
    solutionSteps: [
      { label: "Zählprinzip", expression: "Anzahl = n₁ · n₂" },
      { label: "Einsetzen", expression: `${n1} · ${n2}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
