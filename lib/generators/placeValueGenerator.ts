import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const PLACE_NAMES = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender"];

// "What's the value of the digit at place X" — directly continues the
// M5 1.1 lesson's place-value decomposition. Tier controls number length.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const digitCount = Math.min(difficultyTier, 5) + 2; // tier 1 -> 3 digits, tier 5 -> 7 digits

  let number = rng.int(10 ** (digitCount - 1), 10 ** digitCount - 1);
  const digits = String(number).split("").map(Number);

  const placeIndexFromRight = rng.int(0, digitCount - 1);
  const digitIndex = digits.length - 1 - placeIndexFromRight;
  const digit = digits[digitIndex];
  const placeValue = 10 ** placeIndexFromRight;
  const digitValue = digit * placeValue;
  const placeName = PLACE_NAMES[placeIndexFromRight] ?? `10^${placeIndexFromRight}`;

  return {
    question: {
      format: "numeric",
      prompt: `Welchen Wert hat die Ziffer an der ${placeName}stelle in der Zahl ${number}?`,
    },
    answer: { value: digitValue },
    solutionSteps: [
      { label: "Zahl", expression: String(number) },
      { label: `Ziffer an der ${placeName}stelle`, expression: String(digit) },
      { label: "Stellenwert", expression: `${placeName} = ${placeValue}` },
      { label: "Ergebnis", expression: `${digit} · ${placeValue} = ${digitValue}` },
    ],
  };
}
