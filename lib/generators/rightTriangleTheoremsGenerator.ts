import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Höhensatz (M10 LB3): h^2 = p·q. Segments p and q are built as perfect
// squares (p=x^2, q=y^2) so h = x·y comes out exact, no irrational heights.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxFactor = 2 + Math.ceil(difficultyTier / 2);
  const x = rng.int(2, maxFactor);
  const y = rng.int(2, maxFactor);
  const p = x * x;
  const q = y * y;
  const h = x * y;

  return {
    question: {
      format: "numeric",
      prompt: `Der Höhensatz gilt in einem rechtwinkligen Dreieck: h² = p · q. Gegeben: p = ${p} cm, q = ${q} cm. Wie lang ist die Höhe h?`,
    },
    answer: { value: h },
    solutionSteps: [
      { label: "Höhensatz", expression: "h² = p · q" },
      { label: "Einsetzen", expression: `h² = ${p} · ${q} = ${h * h}` },
      { label: "Wurzel ziehen", expression: `h = √${h * h} = ${h}` },
    ],
  };
}
