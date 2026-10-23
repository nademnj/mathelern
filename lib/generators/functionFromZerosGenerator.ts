import { makeRng } from "./prng";
import { makeMonicQuadraticFromRoots } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Determine a function's term from its zeros (FOS11 LB1): y = (x-r1)(x-r2)
// expands to the monic quadratic x^2 + px + q, built via the shared helper.
export function generate({ seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const { r1, r2, p, q } = makeMonicQuadraticFromRoots(rng);

  return {
    question: {
      format: "numeric",
      prompt: `Eine quadratische Funktion hat die Nullstellen x₁ = ${r1} und x₂ = ${r2}. Wie lautet q in der Funktionsgleichung y = x² + ${p}x + q?`,
    },
    answer: { value: q },
    solutionSteps: [
      { label: "Ansatz aus Nullstellen", expression: `y = (x - ${r1}) · (x - ${r2})` },
      { label: "Ausmultiplizieren", expression: `y = x² ${p >= 0 ? "+" : "-"} ${Math.abs(p)}x ${q >= 0 ? "+" : "-"} ${Math.abs(q)}` },
      { label: "q", expression: `q = ${q}` },
    ],
  };
}
