import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const UNIT_SETS = [
  { from: "m", to: "cm", factor: 100 },
  { from: "km", to: "m", factor: 1000 },
  { from: "kg", to: "g", factor: 1000 },
  { from: "t", to: "kg", factor: 1000 },
  { from: "h", to: "min", factor: 60 },
  { from: "min", to: "s", factor: 60 },
  { from: "l", to: "ml", factor: 1000 },
] as const;

// Converting between units within the same measurement family (length,
// mass, time, capacity) -- tier controls whether the starting value has a
// decimal part (harder: needs the comma shifted correctly).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const set = rng.pick(UNIT_SETS);
  const useDecimal = difficultyTier >= 3 && rng.next() < 0.6;
  const whole = rng.int(1, difficultyTier >= 4 ? 40 : 20);
  const value = useDecimal ? whole + rng.pick([0.25, 0.5, 0.75]) : whole;
  const result = Math.round(value * set.factor * 100) / 100;

  return {
    question: {
      format: "numeric",
      prompt: `Wandle um: ${value} ${set.from} = ? ${set.to}`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Umrechnungsfaktor", expression: `1 ${set.from} = ${set.factor} ${set.to}` },
      { label: "Einsetzen", expression: `${value} · ${set.factor}` },
      { label: "Ergebnis", expression: `${result} ${set.to}` },
    ],
  };
}
