import { makeRng } from "./prng";
import { gcd } from "./mathUtils";
import type { GeneratedExercise, GeneratorArgs } from "./types";

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// ggT (GCD) or kgV (LCM) of two numbers -- the two core skills of M5
// "Teilbarkeit, Primfaktoren, ggT und kgV". Tier scales the number range.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxN = [20, 30, 50, 80, 120][Math.min(difficultyTier, 5) - 1];
  const a = rng.int(4, maxN);
  const b = rng.int(4, maxN);
  const askLcm = rng.next() < 0.5;

  if (askLcm) {
    const g = gcd(a, b);
    const result = lcm(a, b);
    return {
      question: { format: "numeric", prompt: `Bestimme das kleinste gemeinsame Vielfache (kgV) von ${a} und ${b}.` },
      answer: { value: result },
      solutionSteps: [
        { label: "ggT zuerst", expression: `ggT(${a}, ${b}) = ${g}` },
        { label: "Formel", expression: "kgV(a,b) = a · b / ggT(a,b)" },
        { label: "Einsetzen", expression: `kgV(${a}, ${b}) = ${a} · ${b} / ${g}` },
        { label: "Ergebnis", expression: `${result}` },
      ],
    };
  }

  const result = gcd(a, b);
  return {
    question: { format: "numeric", prompt: `Bestimme den größten gemeinsamen Teiler (ggT) von ${a} und ${b}.` },
    answer: { value: result },
    solutionSteps: [
      { label: "Teiler von a", expression: `Teiler von ${a} auflisten` },
      { label: "Teiler von b", expression: `Teiler von ${b} auflisten` },
      { label: "Größter gemeinsamer Teiler", expression: `ggT(${a}, ${b}) = ${result}` },
    ],
  };
}
