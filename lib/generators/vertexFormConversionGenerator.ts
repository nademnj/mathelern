import { makeRng } from "./prng";
import { makeMonicQuadraticFromRoots, formatQuadratic } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Normalform <-> Scheitelpunktform (M10 LB7). Tiers 1-2: find d (vertex x).
// Tiers 3-4: find e (vertex y). Tier 5: convert back - expand vertex form
// to normal form and ask for q. All exact via the shared root-based helper.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const { p, q, vertexX, vertexY } = makeMonicQuadraticFromRoots(rng);
  const funcExpr = formatQuadratic(p, q);

  if (difficultyTier <= 2) {
    return {
      question: {
        format: "numeric",
        prompt: `Gegeben ist ${funcExpr}. Wandle in die Scheitelpunktform um: Wie lautet d (die x-Koordinate des Scheitels)?`,
      },
      answer: { value: vertexX },
      solutionSteps: [
        { label: "Normalform", expression: funcExpr },
        { label: "Formel", expression: "d = -p / 2" },
        { label: "Einsetzen", expression: `d = -(${p}) / 2 = ${vertexX}` },
      ],
    };
  }

  if (difficultyTier <= 4) {
    return {
      question: {
        format: "numeric",
        prompt: `Gegeben ist ${funcExpr}. Wie lautet e (die y-Koordinate des Scheitels) in der Scheitelpunktform (x - d)² + e?`,
      },
      answer: { value: vertexY },
      solutionSteps: [
        { label: "Normalform", expression: funcExpr },
        { label: "Scheitelpunkt", expression: `S(${vertexX} | ${vertexY})` },
        { label: "Scheitelpunktform", expression: `(x - ${vertexX})² + ${vertexY}` },
      ],
    };
  }

  return {
    question: {
      format: "numeric",
      prompt: `Gegeben ist die Scheitelpunktform y = (x - ${vertexX})² + ${vertexY}. Wie lautet q in der Normalform y = x² + ${p}x + q?`,
    },
    answer: { value: q },
    solutionSteps: [
      { label: "Scheitelpunktform", expression: `(x - ${vertexX})² + ${vertexY}` },
      { label: "Ausmultiplizieren", expression: `x² - ${2 * vertexX}x + ${vertexX * vertexX} + ${vertexY}` },
      { label: "q berechnen", expression: `q = ${vertexX}² + ${vertexY} = ${q}` },
    ],
  };
}
