import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Sum of all edge lengths of a cuboid (4·(a+b+c)) -- a concrete numeric
// skill tying into "Körper, Netze, Schrägbilder" without needing a drawn net.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const maxEdge = [8, 10, 14, 18, 25][Math.min(difficultyTier, 5) - 1];
  const a = rng.int(2, maxEdge);
  const b = rng.int(2, maxEdge);
  const c = rng.int(2, maxEdge);
  const result = 4 * (a + b + c);

  return {
    question: {
      format: "numeric",
      prompt: `Ein Quader hat die Kantenlängen ${a} cm, ${b} cm und ${c} cm. Wie lang sind alle Kanten zusammen?`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Ein Quader hat", expression: "4 Kanten jeder Länge (a, b, c)" },
      { label: "Formel", expression: "Gesamtlänge = 4 · (a + b + c)" },
      { label: "Einsetzen", expression: `4 · (${a} + ${b} + ${c})` },
      { label: "Ergebnis", expression: `${result} cm` },
    ],
  };
}
