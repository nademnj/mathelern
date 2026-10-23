import { makeRng } from "./prng";
import { makeMonicQuadraticFromRoots, formatQuadratic } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Solving quadratic equations (M10 LB7). Tiers 1-2: rein-quadratisch
// (x^2 = c), solved by taking a root. Tiers 3-5: gemischtquadratisch,
// built from two chosen integer roots via the shared helper.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);

  if (difficultyTier <= 2) {
    const root = rng.int(2, 6 + difficultyTier);
    const c = root * root;
    return {
      question: { format: "numeric", prompt: `Löse die rein-quadratische Gleichung: x² = ${c}. Gib die positive Lösung an.` },
      answer: { value: root },
      solutionSteps: [
        { label: "Gleichung", expression: `x² = ${c}` },
        { label: "Wurzel ziehen", expression: `x = ±√${c}` },
        { label: "Positive Lösung", expression: `x = ${root}` },
      ],
    };
  }

  const { p, q, r1, r2 } = makeMonicQuadraticFromRoots(rng);
  const largerRoot = Math.max(r1, r2);
  const eq = `${formatQuadratic(p, q).replace("y = ", "")} = 0`;

  return {
    question: { format: "numeric", prompt: `Löse die gemischtquadratische Gleichung: ${eq}. Gib die größere Lösung an.` },
    answer: { value: largerRoot },
    solutionSteps: [
      { label: "Gleichung", expression: eq },
      { label: "Mitternachtsformel", expression: "x = (-p ± √(p² - 4q)) / 2" },
      { label: "Lösungen", expression: `x₁ = ${Math.min(r1, r2)}, x₂ = ${largerRoot}` },
    ],
  };
}
