import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Zentrische Streckung / similar figures (M10 LB3). Tiers 1-3 enlarge by an
// integer factor; tiers 4-5 shrink by 1/2, with the original length always
// chosen even so the result stays a clean integer either way.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const enlarging = difficultyTier <= 3;
  const factor = enlarging ? rng.pick([2, 3] as const) : 0.5;
  const original = enlarging ? rng.int(2, 6) : rng.int(2, 8) * 2;
  const scaled = original * factor;
  const verb = factor >= 1 ? "vergrößert" : "verkleinert";

  return {
    question: {
      format: "numeric",
      prompt: `Eine Strecke von ${original} cm wird mit dem Streckungsfaktor ${factor} ${verb}. Wie lang ist die neue Strecke?`,
    },
    answer: { value: scaled },
    solutionSteps: [
      { label: "Streckungsfaktor", expression: `k = ${factor}` },
      { label: "Formel", expression: "neue Länge = alte Länge · k" },
      { label: "Einsetzen", expression: `${original} · ${factor} = ${scaled}` },
    ],
  };
}
