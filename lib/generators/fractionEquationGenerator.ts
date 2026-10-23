import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Bruchgleichungen (M10 LB7). Tiers 1-2: a/x = b. Tiers 3-5: x/a + c = d.
// Every value is built from the target x so the answer is always exact.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);

  if (difficultyTier <= 2) {
    const x = rng.int(2, 6 + difficultyTier);
    const b = rng.int(2, 5);
    const a = b * x;
    return {
      question: { format: "numeric", prompt: `Löse die Bruchgleichung: ${a} / x = ${b}` },
      answer: { value: x },
      solutionSteps: [
        { label: "Gleichung", expression: `${a} / x = ${b}` },
        { label: "Mit x multiplizieren", expression: `${a} = ${b} · x` },
        { label: "Nach x auflösen", expression: `x = ${a} / ${b} = ${x}` },
      ],
    };
  }

  const a = rng.int(2, 5);
  const k = rng.int(1, 4 + difficultyTier);
  const x = a * k;
  const c = rng.int(1, 6);
  const d = k + c;

  return {
    question: { format: "numeric", prompt: `Löse die Bruchgleichung: x/${a} + ${c} = ${d}` },
    answer: { value: x },
    solutionSteps: [
      { label: "Gleichung", expression: `x/${a} + ${c} = ${d}` },
      { label: `${c} subtrahieren`, expression: `x/${a} = ${d - c}` },
      { label: `Mit ${a} multiplizieren`, expression: `x = ${d - c} · ${a} = ${x}` },
    ],
  };
}
