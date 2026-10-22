import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// "Kürze den Bruch" (simplify the fraction). Difficulty tier controls the
// size of the simplified denominator and how many extra factors are folded
// in, so higher tiers require spotting a less obvious common factor.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxSimpleDenom = [4, 6, 9, 12, 16][Math.min(difficultyTier, 5) - 1];
  const maxMultiplier = [2, 3, 3, 4, 5][Math.min(difficultyTier, 5) - 1];

  let a: number, b: number;
  do {
    b = rng.int(2, maxSimpleDenom);
    a = rng.int(1, b - 1);
  } while (gcd(a, b) !== 1);

  const k = rng.int(2, maxMultiplier);
  const numerator = a * k;
  const denominator = b * k;

  return {
    question: {
      format: "fraction",
      prompt: `Kürze den Bruch ${numerator}/${denominator} so weit wie möglich.`,
    },
    answer: { numerator: a, denominator: b },
    solutionSteps: [
      { label: "Ausgangsbruch", expression: `${numerator}/${denominator}` },
      { label: "Größter gemeinsamer Teiler", expression: `ggT(${numerator}, ${denominator}) = ${k}` },
      { label: "Beide Seiten teilen", expression: `${numerator} ÷ ${k} / ${denominator} ÷ ${k}` },
      { label: "Ergebnis", expression: `${a}/${b}` },
    ],
  };
}
