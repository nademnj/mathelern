import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Rectangle area (tiers 1-3) or perimeter (tiers 4-5, mixed with area at
// random) — perimeter requires the extra "times two" step students tend to
// forget, so it's reserved for the higher tiers.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxSide = [8, 10, 12, 16, 20][Math.min(difficultyTier, 5) - 1];
  const width = rng.int(2, maxSide);
  const height = rng.int(2, maxSide);

  const askPerimeter = difficultyTier >= 4 && rng.next() < 0.5;

  if (askPerimeter) {
    const perimeter = 2 * (width + height);
    return {
      question: {
        format: "numeric",
        prompt: `Ein Rechteck ist ${width} cm breit und ${height} cm hoch. Wie groß ist der Umfang?`,
      },
      answer: { value: perimeter },
      solutionSteps: [
        { label: "Formel", expression: "U = 2 · (Breite + Höhe)" },
        { label: "Einsetzen", expression: `U = 2 · (${width} + ${height})` },
        { label: "Ergebnis", expression: `U = ${perimeter} cm` },
      ],
    };
  }

  const area = width * height;
  return {
    question: {
      format: "numeric",
      prompt: `Ein Rechteck ist ${width} cm breit und ${height} cm hoch. Wie groß ist der Flächeninhalt?`,
    },
    answer: { value: area },
    solutionSteps: [
      { label: "Formel", expression: "A = Breite · Höhe" },
      { label: "Einsetzen", expression: `A = ${width} · ${height}` },
      { label: "Ergebnis", expression: `A = ${area} cm²` },
    ],
  };
}
