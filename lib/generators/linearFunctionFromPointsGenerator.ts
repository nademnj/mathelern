import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Determine a linear function's equation from two points (M10 LB7) -- more
// applied than FOS11's polynomialFunctionsGenerator, which reads slope/
// intercept straight off a given equation. Points are built from a chosen
// (m, t) so both tier variants have an exact integer answer.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const m = rng.pick([-3, -2, -1, 1, 2, 3] as const);
  const t = rng.int(-8, 8);
  const x1 = rng.int(-4, 0);
  let x2 = rng.int(1, 4);
  while (x2 === x1) x2 = rng.int(1, 4);
  const y1 = m * x1 + t;
  const y2 = m * x2 + t;

  if (difficultyTier <= 3) {
    return {
      question: {
        format: "numeric",
        prompt: `Eine Gerade verläuft durch die Punkte A(${x1}|${y1}) und B(${x2}|${y2}). Wie groß ist die Steigung m?`,
      },
      answer: { value: m },
      solutionSteps: [
        { label: "Steigungsformel", expression: "m = (y₂ - y₁) / (x₂ - x₁)" },
        { label: "Einsetzen", expression: `m = (${y2} - ${y1}) / (${x2} - ${x1}) = ${m}` },
      ],
    };
  }

  return {
    question: {
      format: "numeric",
      prompt: `Eine Gerade verläuft durch die Punkte A(${x1}|${y1}) und B(${x2}|${y2}). Wie groß ist der y-Achsenabschnitt t?`,
    },
    answer: { value: t },
    solutionSteps: [
      { label: "Steigung (bereits berechnet)", expression: `m = ${m}` },
      { label: "Einsetzen in y = mx + t mit Punkt A", expression: `${y1} = ${m} · ${x1} + t` },
      { label: "Nach t auflösen", expression: `t = ${t}` },
    ],
  };
}
