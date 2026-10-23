import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Strahlensatz / intercept theorem (M10 LB3): a:c = b:x. c and x are built
// as a·k and b·k for an integer k, so x always comes out exact.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const a = rng.int(2, 3 + difficultyTier);
  const b = rng.int(2, 3 + difficultyTier);
  const k = rng.int(2, 2 + Math.ceil(difficultyTier / 2));
  const c = a * k;
  const x = b * k;

  return {
    question: {
      format: "numeric",
      prompt: `Nach dem Strahlensatz gilt a : c = b : x. Gegeben: a = ${a} cm, c = ${c} cm, b = ${b} cm. Wie groß ist x?`,
    },
    answer: { value: x },
    solutionSteps: [
      { label: "Strahlensatz", expression: "a : c = b : x" },
      { label: "Umstellen", expression: "x = (b · c) / a" },
      { label: "Einsetzen", expression: `x = (${b} · ${c}) / ${a} = ${x}` },
    ],
  };
}
