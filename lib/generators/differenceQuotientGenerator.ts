import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Differenzenquotient / average rate of change (FOS11 LB2) for f(x) = x^2,
// which simplifies cleanly to x1 + x2 -- no decimals at any tier.
export function generate({ seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const x1 = rng.int(-5, 5);
  let x2 = rng.int(-5, 5);
  while (x2 === x1) x2 = rng.int(-5, 5);
  const result = x1 + x2;

  return {
    question: {
      format: "numeric",
      prompt: `Für f(x) = x²: Wie groß ist der Differenzenquotient zwischen x₁ = ${x1} und x₂ = ${x2}?`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Formel", expression: "(f(x₂) - f(x₁)) / (x₂ - x₁)" },
      { label: "Für f(x) = x²", expression: "= x₁ + x₂" },
      { label: "Einsetzen", expression: `${x1} + ${x2} = ${result}` },
    ],
  };
}
