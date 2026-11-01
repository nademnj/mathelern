import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// "Punkt- vor Strichrechnung" and brackets -- evaluating a small mixed
// expression correctly, the whole point of the Rechengesetze.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxN = [10, 12, 15, 20, 25][Math.min(difficultyTier, 5) - 1];
  const useBrackets = difficultyTier >= 3 && rng.next() < 0.5;

  const a = rng.int(1, maxN);
  const b = rng.int(1, maxN);
  const c = rng.int(2, 9);

  if (useBrackets) {
    const result = (a + b) * c;
    return {
      question: { format: "numeric", prompt: `Berechne: (${a} + ${b}) · ${c}` },
      answer: { value: result },
      solutionSteps: [
        { label: "Klammer zuerst", expression: `${a} + ${b} = ${a + b}` },
        { label: "Dann multiplizieren", expression: `${a + b} · ${c}` },
        { label: "Ergebnis", expression: `${result}` },
      ],
    };
  }

  const result = a + b * c;
  return {
    question: { format: "numeric", prompt: `Berechne: ${a} + ${b} · ${c}` },
    answer: { value: result },
    solutionSteps: [
      { label: "Punkt vor Strich", expression: `${b} · ${c} = ${b * c}` },
      { label: "Dann addieren", expression: `${a} + ${b * c}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
