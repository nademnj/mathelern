import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Differenzialquotient / tangent slope (FOS11 LB2) for f(x) = x^2, so
// f'(x) = 2x -- an exact integer slope at every integer x0.
export function generate({ seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const x0 = rng.int(-6, 6);
  const slope = 2 * x0;

  return {
    question: { format: "numeric", prompt: `Für f(x) = x²: Wie groß ist die Tangentensteigung an der Stelle x = ${x0}?` },
    answer: { value: slope },
    solutionSteps: [
      { label: "Ableitung", expression: "f'(x) = 2x" },
      { label: "Einsetzen", expression: `f'(${x0}) = 2 · ${x0}` },
      { label: "Ergebnis", expression: `${slope}` },
    ],
  };
}
