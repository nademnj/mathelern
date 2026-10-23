import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const SIMPLE_ANGLES = [0, 90, 180, 270] as const;
const ALL_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330] as const;

// Unit circle coordinates (M10 LB4). Tiers 1-2 stick to the axis-aligned
// angles (exact 0/±1 values); tiers 3-5 use the full 30°/45°-step set,
// rounded to 2 decimals (within the generic 0.05 tolerance).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const angle = rng.pick(difficultyTier <= 2 ? SIMPLE_ANGLES : ALL_ANGLES);
  const axis = rng.pick(["sin", "cos"] as const);
  const radians = (angle * Math.PI) / 180;
  const raw = axis === "sin" ? Math.sin(radians) : Math.cos(radians);
  const value = Math.round(raw * 100) / 100;

  return {
    question: {
      format: "numeric",
      prompt: `Am Einheitskreis: Welchen ${axis === "sin" ? "y-Wert (sin)" : "x-Wert (cos)"} hat der Punkt bei ${angle}°? (Runde auf zwei Nachkommastellen.)`,
    },
    answer: { value },
    solutionSteps: [
      { label: "Einheitskreis", expression: `Winkel = ${angle}°` },
      { label: "Koordinaten", expression: `(cos(${angle}°) | sin(${angle}°))` },
      { label: "Ergebnis", expression: `${axis}(${angle}°) ≈ ${value}` },
    ],
  };
}
