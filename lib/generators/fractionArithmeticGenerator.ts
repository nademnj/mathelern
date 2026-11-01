import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

// Add, subtract, multiply, or divide two fractions -- tier controls
// denominator size and which operation (·/÷ are introduced at higher tiers
// since they don't need a common denominator but are conceptually newer).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxDenom = [4, 6, 8, 10, 12][Math.min(difficultyTier, 5) - 1];
  const ops = difficultyTier >= 3 ? (["+", "-", "·", ":"] as const) : (["+", "-"] as const);
  const op = rng.pick(ops);

  const d1 = rng.int(2, maxDenom);
  const d2 = rng.int(2, maxDenom);
  let n1 = rng.int(1, d1 - 1);
  let n2 = rng.int(1, d2 - 1);

  // Keep this topic's scope non-negative: for subtraction, the first
  // fraction must be the larger one -- swap BEFORE building the question
  // so the prompt and the computed answer always agree.
  let fd1 = d1;
  let fd2 = d2;
  if (op === "-" && n1 * d2 < n2 * d1) {
    [n1, fd1, n2, fd2] = [n2, d2, n1, d1];
  }

  let resultN: number;
  let resultD: number;
  let stepExpr: string;

  if (op === "+" || op === "-") {
    resultD = fd1 * fd2;
    const scaledN1 = n1 * fd2;
    const scaledN2 = n2 * fd1;
    resultN = op === "+" ? scaledN1 + scaledN2 : scaledN1 - scaledN2;
    stepExpr = `${scaledN1}/${resultD} ${op} ${scaledN2}/${resultD}`;
  } else if (op === "·") {
    resultN = n1 * n2;
    resultD = fd1 * fd2;
    stepExpr = `(${n1} · ${n2}) / (${fd1} · ${fd2})`;
  } else {
    resultN = n1 * fd2;
    resultD = fd1 * n2;
    stepExpr = `${n1}/${fd1} · ${fd2}/${n2}`;
  }

  const [simpN, simpD] = simplify(resultN, resultD);

  return {
    question: { format: "fraction", prompt: `Berechne: ${n1}/${fd1} ${op} ${n2}/${fd2}` },
    answer: { numerator: simpN, denominator: simpD },
    solutionSteps: [
      { label: "Aufgabe", expression: `${n1}/${fd1} ${op} ${n2}/${fd2}` },
      { label: "Umformen", expression: stepExpr },
      { label: "Kürzen", expression: `${simpN}/${simpD}` },
    ],
  };
}
