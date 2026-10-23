import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Symmetry of a pure power function (FOS11 LB1): only-even exponents are
// symmetric to the y-axis, only-odd exponents to the origin. Text-format
// answer, matched case-insensitively.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const isEven = rng.next() < 0.5;
  const a = rng.pick([1, 2, 3, -1, -2] as const);
  const degree = isEven ? rng.pick([2, 4] as const) : rng.pick([1, 3] as const);
  const funcExpr = `y = ${a}x^${degree}`;
  const answerText = isEven ? "achsensymmetrisch" : "punktsymmetrisch";

  return {
    question: {
      format: "text",
      prompt: `Gegeben ist ${funcExpr}. Ist der Graph achsensymmetrisch (zur y-Achse) oder punktsymmetrisch (zum Ursprung)?`,
    },
    answer: { text: answerText },
    solutionSteps: [
      { label: "Exponent", expression: `Exponent ${degree} ist ${isEven ? "gerade" : "ungerade"}` },
      { label: "Regel", expression: isEven ? "Gerade Exponenten → achsensymmetrisch" : "Ungerade Exponenten → punktsymmetrisch" },
      { label: "Ergebnis", expression: answerText },
    ],
  };
}
