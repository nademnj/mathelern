import { makeRng } from "./prng";
import { makeMonicQuadraticFromRoots, formatQuadratic } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Extremum via the derivative (FOS11 LB2): f'(x) = 2x + p = 0 => x = -p/2 --
// the same vertex math as M10's Scheitelpunkt topic, reached via calculus
// instead of completing the square (the FOS-appropriate method).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const { p, q, vertexX, vertexY } = makeMonicQuadraticFromRoots(rng);
  const funcExpr = formatQuadratic(p, q);

  if (difficultyTier <= 3) {
    return {
      question: { format: "numeric", prompt: `Gegeben ist ${funcExpr}. Bestimme die x-Koordinate des Extrempunkts über die Ableitung.` },
      answer: { value: vertexX },
      solutionSteps: [
        { label: "Ableitung", expression: `f'(x) = 2x + ${p}` },
        { label: "Nullsetzen", expression: `2x + ${p} = 0` },
        { label: "Auflösen", expression: `x = ${vertexX}` },
      ],
    };
  }

  return {
    question: { format: "numeric", prompt: `Gegeben ist ${funcExpr}. Wie groß ist der Funktionswert am Extrempunkt?` },
    answer: { value: vertexY },
    solutionSteps: [
      { label: "x-Koordinate (f'(x) = 0)", expression: `x = ${vertexX}` },
      { label: "Einsetzen in f(x)", expression: `f(${vertexX}) = ${vertexY}` },
    ],
  };
}
