import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Surface area or volume of a cuboid (cube when a=b=c) -- tier controls
// edge size and, at higher tiers, favors surface area (more steps).
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxEdge = [6, 8, 10, 14, 18][Math.min(difficultyTier, 5) - 1];
  const isCube = rng.next() < 0.3;
  const a = rng.int(2, maxEdge);
  const b = isCube ? a : rng.int(2, maxEdge);
  const c = isCube ? a : rng.int(2, maxEdge);

  const askSurface = difficultyTier >= 3 ? rng.next() < 0.6 : rng.next() < 0.5;

  if (askSurface) {
    const surface = 2 * (a * b + a * c + b * c);
    return {
      question: {
        format: "numeric",
        prompt: isCube
          ? `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist seine Oberfläche?`
          : `Ein Quader hat die Kanten ${a} cm, ${b} cm und ${c} cm. Wie groß ist seine Oberfläche?`,
      },
      answer: { value: surface },
      solutionSteps: [
        { label: "Formel", expression: "O = 2 · (a·b + a·c + b·c)" },
        { label: "Einsetzen", expression: `O = 2 · (${a}·${b} + ${a}·${c} + ${b}·${c})` },
        { label: "Ergebnis", expression: `O = ${surface} cm²` },
      ],
    };
  }

  const volume = a * b * c;
  return {
    question: {
      format: "numeric",
      prompt: isCube
        ? `Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist sein Volumen?`
        : `Ein Quader hat die Kanten ${a} cm, ${b} cm und ${c} cm. Wie groß ist sein Volumen?`,
    },
    answer: { value: volume },
    solutionSteps: [
      { label: "Formel", expression: "V = a · b · c" },
      { label: "Einsetzen", expression: `V = ${a} · ${b} · ${c}` },
      { label: "Ergebnis", expression: `V = ${volume} cm³` },
    ],
  };
}
