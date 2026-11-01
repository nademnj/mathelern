import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Addition/subtraction with negative numbers. Higher tiers widen the range
// and are more likely to let the second number be negative too (turning
// subtraction into addition) -- the thing students usually trip on.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxAbs = [10, 15, 20, 30, 50][Math.min(difficultyTier, 5) - 1];
  const allowNegativeB = difficultyTier >= 2;

  const a = rng.int(-maxAbs, maxAbs);
  let b = rng.int(allowNegativeB ? -maxAbs : 1, maxAbs);
  if (b === 0) b = 1;
  const useSubtraction = rng.next() < 0.5;

  const op = useSubtraction ? "-" : "+";
  const result = useSubtraction ? a - b : a + b;
  const bDisplay = b < 0 ? `(${b})` : `${b}`;

  const steps =
    useSubtraction && b < 0
      ? [
          { label: "Minus mal Minus wird Plus", expression: `${a} - (${b}) = ${a} + ${-b}` },
          { label: "Ergebnis", expression: `${result}` },
        ]
      : [
          { label: "Zahlenstrahl", expression: `Start bei ${a}, dann ${useSubtraction ? "nach links" : "nach rechts"} um ${Math.abs(b)}` },
          { label: "Ergebnis", expression: `${result}` },
        ];

  return {
    question: { format: "numeric", prompt: `Berechne: ${a} ${op} ${bDisplay}` },
    answer: { value: result },
    solutionSteps: [{ label: "Aufgabe", expression: `${a} ${op} ${bDisplay}` }, ...steps],
  };
}
