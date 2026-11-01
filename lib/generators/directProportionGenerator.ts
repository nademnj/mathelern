import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const CONTEXTS = [
  { item: "Äpfel", costWord: "kosten" },
  { item: "Hefte", costWord: "kosten" },
  { item: "Liter Benzin", costWord: "kosten" },
] as const;

// Classic Dreisatz (rule of three): N units cost X, how much do M units
// cost -- the direct-proportionality skill. Tier controls the numbers'
// size.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const context = rng.pick(CONTEXTS);
  const unitPrice = rng.int(1, [5, 8, 10, 15, 20][Math.min(difficultyTier, 5) - 1]);
  const n = rng.int(2, 10);
  const totalCost = unitPrice * n;
  const m = rng.int(2, 12);
  const answer = unitPrice * m;

  return {
    question: {
      format: "numeric",
      prompt: `${n} ${context.item} ${context.costWord} ${totalCost} €. Wie viel ${context.costWord} ${m} ${context.item}?`,
    },
    answer: { value: answer },
    solutionSteps: [
      { label: "Erster Schritt: auf 1 Einheit", expression: `${totalCost} € : ${n} = ${unitPrice} €` },
      { label: "Zweiter Schritt: hochrechnen", expression: `${unitPrice} € · ${m}` },
      { label: "Ergebnis", expression: `${answer} €` },
    ],
  };
}
