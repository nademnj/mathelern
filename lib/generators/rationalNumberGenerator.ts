import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Comparing negative rational numbers -- the counter-intuitive part of
// "Rationale Zahlen" is that -5 < -2 even though 5 > 2. Tier controls
// whether the numbers have a decimal part and how large they get.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxAbs = [10, 15, 20, 30, 50][Math.min(difficultyTier, 5) - 1];
  const useDecimal = difficultyTier >= 2;

  const rawA = rng.int(1, maxAbs * 10) / 10;
  const rawB = rng.int(1, maxAbs * 10) / 10;
  const a = -(useDecimal ? rawA : Math.round(rawA));
  let b = -(useDecimal ? rawB : Math.round(rawB));
  if (a === b) b -= 1;

  const smaller = Math.min(a, b);

  return {
    question: {
      format: "numeric",
      prompt: `Vergleiche ${a} und ${b}. Welche der beiden Zahlen ist kleiner (liegt weiter links auf der Zahlengeraden)? Gib die kleinere Zahl ein.`,
    },
    answer: { value: smaller },
    solutionSteps: [
      { label: "Merke", expression: "Bei negativen Zahlen ist die mit dem größeren Betrag die kleinere Zahl." },
      { label: "Beträge vergleichen", expression: `|${a}| = ${Math.abs(a)}, |${b}| = ${Math.abs(b)}` },
      { label: "Ergebnis", expression: `${smaller} ist kleiner` },
    ],
  };
}
