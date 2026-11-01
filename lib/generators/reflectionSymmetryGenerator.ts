import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Reflecting a point across the x-axis or y-axis -- the core
// "Achsenspiegelung" skill. Reflecting across the x-axis flips the sign of
// y; across the y-axis flips the sign of x.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCoord = [5, 6, 8, 10, 12][Math.min(difficultyTier, 5) - 1];
  const x = rng.int(-maxCoord, maxCoord) || 1;
  const y = rng.int(-maxCoord, maxCoord) || 1;
  const axis = rng.pick(["x", "y"] as const);

  const resultX = axis === "y" ? -x : x;
  const resultY = axis === "x" ? -y : y;

  return {
    question: {
      format: "text",
      prompt: `Spiegle den Punkt P(${x}|${y}) an der ${axis}-Achse. Gib das Ergebnis als "x|y" ein (z.B. 3|-2).`,
    },
    answer: { text: `${resultX}|${resultY}` },
    solutionSteps: [
      {
        label: "Regel",
        expression: axis === "x" ? "Spiegelung an der x-Achse: y wird negativ" : "Spiegelung an der y-Achse: x wird negativ",
      },
      { label: "Ausgangspunkt", expression: `P(${x}|${y})` },
      { label: "Ergebnis", expression: `P'(${resultX}|${resultY})` },
    ],
  };
}
