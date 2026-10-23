import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Sphere surface/volume (M10 LB5). Results involve pi so they're rounded to
// 2 decimals -- within the generic 0.05 answer tolerance, which absorbs a
// student's own calculator rounding. Tiers 1-3 ask for surface area, 4-5
// for volume (the more error-prone formula).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const r = rng.int(2, 4 + difficultyTier);

  if (difficultyTier >= 4) {
    const volume = Math.round(((4 / 3) * Math.PI * r ** 3) * 100) / 100;
    return {
      question: {
        format: "numeric",
        prompt: `Eine Kugel hat den Radius r = ${r} cm. Wie groß ist ihr Volumen? (Runde auf zwei Nachkommastellen, π ≈ 3,14159)`,
      },
      answer: { value: volume },
      solutionSteps: [
        { label: "Formel", expression: "V = (4/3) · π · r³" },
        { label: "Einsetzen", expression: `V = (4/3) · π · ${r}³` },
        { label: "Ergebnis", expression: `V ≈ ${volume} cm³` },
      ],
    };
  }

  const surface = Math.round(4 * Math.PI * r ** 2 * 100) / 100;
  return {
    question: {
      format: "numeric",
      prompt: `Eine Kugel hat den Radius r = ${r} cm. Wie groß ist ihre Oberfläche? (Runde auf zwei Nachkommastellen, π ≈ 3,14159)`,
    },
    answer: { value: surface },
    solutionSteps: [
      { label: "Formel", expression: "O = 4 · π · r²" },
      { label: "Einsetzen", expression: `O = 4 · π · ${r}²` },
      { label: "Ergebnis", expression: `O ≈ ${surface} cm²` },
    ],
  };
}
