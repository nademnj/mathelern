import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Baumdiagramm / path rule (M10 LB6): drawing twice WITH replacement from
// an urn, probability of a specific 2-step path, as a simplified fraction.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxCount = 2 + Math.ceil(difficultyTier / 2);
  const red = rng.int(1, maxCount);
  const blue = rng.int(1, maxCount);
  const total = red + blue;
  const numerator = red * blue;
  const denominator = total * total;
  const g = gcd(numerator, denominator);

  return {
    question: {
      format: "fraction",
      prompt: `Eine Urne enthält ${red} rote und ${blue} blaue Kugeln. Du ziehst zweimal mit Zurücklegen. Wie groß ist die Wahrscheinlichkeit für "zuerst rot, dann blau"? (Als gekürzter Bruch)`,
    },
    answer: { numerator: numerator / g, denominator: denominator / g },
    solutionSteps: [
      { label: "1. Ziehung: rot", expression: `P(rot) = ${red}/${total}` },
      { label: "2. Ziehung: blau", expression: `P(blau) = ${blue}/${total}` },
      { label: "Pfadregel (multiplizieren)", expression: `P = ${red}/${total} · ${blue}/${total}` },
      { label: "Gekürzt", expression: `${numerator / g}/${denominator / g}` },
    ],
  };
}
