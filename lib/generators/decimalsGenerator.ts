import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Addition/subtraction of decimals. Tier controls decimal places (1 vs 2)
// and whether subtraction (harder, needs borrowing) is in the mix.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const places = difficultyTier <= 2 ? 1 : 2;
  const scale = 10 ** places;
  const maxWhole = [10, 20, 50, 100, 200][Math.min(difficultyTier, 5) - 1];

  const randDecimal = () => rng.int(1, maxWhole * scale) / scale;
  let a = randDecimal();
  const useSubtraction = difficultyTier >= 3 && rng.next() < 0.5;
  let b = randDecimal();
  if (useSubtraction && b > a) [a, b] = [b, a]; // avoid negative results for this topic's scope

  const op = useSubtraction ? "-" : "+";
  const raw = useSubtraction ? a - b : a + b;
  const result = Math.round(raw * scale) / scale;

  return {
    question: {
      format: "numeric",
      prompt: `Berechne: ${a.toFixed(places)} ${op} ${b.toFixed(places)}`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Aufgabe", expression: `${a.toFixed(places)} ${op} ${b.toFixed(places)}` },
      { label: "Kommastellen ausrichten", expression: `${a.toFixed(places)}\n${op} ${b.toFixed(places)}` },
      { label: "Ergebnis", expression: result.toFixed(places) },
    ],
  };
}
