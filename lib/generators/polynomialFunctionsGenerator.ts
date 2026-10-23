import { makeRng } from "./prng";
import { makeMonicQuadraticFromRoots, formatQuadratic } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Linear & quadratic functions (FOS11 Lernbereich 1). Tiers 1-2: read the
// slope / y-intercept off a linear function y = mx + t. Tiers 3-5: a monic
// quadratic y = x^2 + px + q built from two chosen integer roots (same
// parity, so the vertex x-coordinate is always a clean integer too) -- no
// decimals or irrational results at any tier.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);

  if (difficultyTier <= 2) {
    const m = rng.pick([-3, -2, -1, 1, 2, 3] as const);
    const t = rng.int(-10, 10);
    const term = `${m}x ${t >= 0 ? "+" : "-"} ${Math.abs(t)}`;

    if (difficultyTier === 1) {
      return {
        question: { format: "numeric", prompt: `Gegeben ist die Funktion y = ${term}. Wie groß ist die Steigung m?` },
        answer: { value: m },
        solutionSteps: [
          { label: "Funktionsgleichung", expression: `y = ${term}` },
          { label: "Form", expression: "y = m · x + t" },
          { label: "Steigung", expression: `m = ${m}` },
        ],
      };
    }
    return {
      question: { format: "numeric", prompt: `Gegeben ist die Funktion y = ${term}. Wie groß ist der y-Achsenabschnitt t?` },
      answer: { value: t },
      solutionSteps: [
        { label: "Funktionsgleichung", expression: `y = ${term}` },
        { label: "Form", expression: "y = m · x + t" },
        { label: "y-Achsenabschnitt", expression: `t = ${t}` },
      ],
    };
  }

  const { r1, r2, p, q, vertexX, vertexY } = makeMonicQuadraticFromRoots(rng);
  const funcExpr = formatQuadratic(p, q);

  if (difficultyTier === 3) {
    return {
      question: { format: "numeric", prompt: `Gegeben ist ${funcExpr}. Wie groß ist die x-Koordinate des Scheitelpunkts?` },
      answer: { value: vertexX },
      solutionSteps: [
        { label: "Funktionsgleichung", expression: funcExpr },
        { label: "Scheitelpunktformel", expression: "x_s = -p / 2" },
        { label: "Einsetzen", expression: `x_s = -(${p}) / 2 = ${vertexX}` },
      ],
    };
  }

  if (difficultyTier === 4) {
    return {
      question: { format: "numeric", prompt: `Gegeben ist ${funcExpr}. Wie groß ist die y-Koordinate des Scheitelpunkts?` },
      answer: { value: vertexY },
      solutionSteps: [
        { label: "Funktionsgleichung", expression: funcExpr },
        { label: "x-Koordinate des Scheitelpunkts", expression: `x_s = ${vertexX}` },
        { label: "Einsetzen", expression: `y_s = ${vertexX}² + (${p})·${vertexX} + (${q}) = ${vertexY}` },
      ],
    };
  }

  const largerRoot = Math.max(r1, r2);
  return {
    question: { format: "numeric", prompt: `Gegeben ist ${funcExpr}. Wie lautet die größere Nullstelle?` },
    answer: { value: largerRoot },
    solutionSteps: [
      { label: "Funktionsgleichung", expression: funcExpr },
      { label: "Mitternachtsformel", expression: "x = (-p ± √(p² - 4q)) / 2" },
      { label: "Nullstellen", expression: `x₁ = ${Math.min(r1, r2)}, x₂ = ${largerRoot}` },
      { label: "Größere Nullstelle", expression: `${largerRoot}` },
    ],
  };
}
