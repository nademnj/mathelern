import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Powers & roots (M10 Lernbereich 1). Tiers 1-2: multiply powers with the
// same base, numeric result (base/exponents kept small so the result stays
// a manageable number). Tier 3: divide powers into a negative exponent,
// answered as a fraction (a^-n = 1/a^n) -- reuses the existing fraction
// answer input, no new UI needed. Tiers 4-5: n-th root of a perfect power,
// chosen so the root is always a clean integer (no irrational results).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);

  if (difficultyTier <= 2) {
    const maxExp = difficultyTier === 1 ? 2 : 3;
    const m = rng.int(1, maxExp);
    const n = rng.int(1, maxExp);
    const sum = m + n;
    const base = sum > 4 ? rng.pick([2, 3] as const) : rng.pick([2, 3, 5] as const);
    const result = base ** sum;
    return {
      question: { format: "numeric", prompt: `Vereinfache und berechne: ${base}^${m} · ${base}^${n}` },
      answer: { value: result },
      solutionSteps: [
        { label: "Potenzgesetz", expression: "a^m · a^n = a^(m+n)" },
        { label: "Exponenten addieren", expression: `${base}^${m} · ${base}^${n} = ${base}^${sum}` },
        { label: "Ergebnis", expression: `${base}^${sum} = ${result}` },
      ],
    };
  }

  if (difficultyTier === 3) {
    const n = rng.int(1, 3);
    const m = rng.int(0, n - 1); // m < n, so the resulting exponent is negative
    const base = rng.pick([2, 3] as const);
    const diff = m - n;
    const denominator = base ** -diff;
    return {
      question: { format: "fraction", prompt: `Vereinfache als Bruch: ${base}^${m} ÷ ${base}^${n}` },
      answer: { numerator: 1, denominator },
      solutionSteps: [
        { label: "Potenzgesetz", expression: "a^m ÷ a^n = a^(m-n)" },
        { label: "Exponenten subtrahieren", expression: `${base}^${m} ÷ ${base}^${n} = ${base}^${diff}` },
        { label: "Negativer Exponent", expression: `${base}^${diff} = 1/${base}^${-diff} = 1/${denominator}` },
      ],
    };
  }

  // Tiers 4-5: n-th root of a perfect power, root/n chosen so it's exact.
  const n = difficultyTier === 4 ? rng.pick([2, 3] as const) : rng.pick([2, 3, 4] as const);
  const root = rng.int(2, 5);
  const radicand = root ** n;
  const rootSymbol = n === 2 ? "√" : `${n}√`;
  return {
    question: {
      format: "numeric",
      prompt: `Berechne die ${n}-te Wurzel aus ${radicand} (${rootSymbol}${radicand}).`,
    },
    answer: { value: root },
    solutionSteps: [
      { label: "Frage", expression: `Welche Zahl hoch ${n} ergibt ${radicand}?` },
      { label: "Probe", expression: `${root}^${n} = ${radicand}` },
      { label: "Ergebnis", expression: `${rootSymbol}${radicand} = ${root}` },
    ],
  };
}
