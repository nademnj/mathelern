import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Area of a triangle (½·g·h) or parallelogram (g·h) -- tier controls the
// number range and, at higher tiers, favors the triangle (needs the extra
// "÷2" step students tend to forget).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxSide = [10, 12, 16, 20, 24][Math.min(difficultyTier, 5) - 1];
  // Keep the base an even number at low tiers so ½·g·h stays a whole number.
  const base = difficultyTier <= 2 ? rng.int(2, Math.floor(maxSide / 2)) * 2 : rng.int(4, maxSide);
  const height = rng.int(2, maxSide);

  const useTriangle = difficultyTier >= 3 ? rng.next() < 0.6 : rng.next() < 0.5;

  if (useTriangle) {
    const area = (base * height) / 2;
    return {
      question: {
        format: "numeric",
        prompt: `Ein Dreieck hat die Grundseite ${base} cm und die Höhe ${height} cm. Wie groß ist der Flächeninhalt?`,
      },
      answer: { value: area },
      solutionSteps: [
        { label: "Formel", expression: "A = (g · h) / 2" },
        { label: "Einsetzen", expression: `A = (${base} · ${height}) / 2` },
        { label: "Ergebnis", expression: `A = ${area} cm²` },
      ],
    };
  }

  const area = base * height;
  return {
    question: {
      format: "numeric",
      prompt: `Ein Parallelogramm hat die Grundseite ${base} cm und die Höhe ${height} cm. Wie groß ist der Flächeninhalt?`,
    },
    answer: { value: area },
    solutionSteps: [
      { label: "Formel", expression: "A = g · h" },
      { label: "Einsetzen", expression: `A = ${base} · ${height}` },
      { label: "Ergebnis", expression: `A = ${area} cm²` },
    ],
  };
}
