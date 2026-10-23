import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Limit of a quadratic as x -> a (FOS11 LB2). Polynomials are continuous, so
// the limit is just the function value at a -- plain substitution.
export function generate({ seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const b = rng.int(-5, 5);
  const c = rng.int(-5, 5);
  const a = rng.int(-4, 4);
  const result = a * a + b * a + c;
  const term = `x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)}`;

  return {
    question: { format: "numeric", prompt: `Berechne den Grenzwert: lim (x → ${a}) von (${term})` },
    answer: { value: result },
    solutionSteps: [
      { label: "Stetigkeit", expression: "Grenzwert = Funktionswert an der Stelle (einsetzen)" },
      { label: "Einsetzen", expression: `${a}² ${b >= 0 ? "+" : "-"} ${Math.abs(b)} · ${a} ${c >= 0 ? "+" : "-"} ${Math.abs(c)}` },
      { label: "Ergebnis", expression: `${result}` },
    ],
  };
}
