import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Sine/cosine/tangent (M10 LB4) and their applied word problems. Uses real
// (not just "special") angles, since calculators are expected at this
// level -- numeric answers are rounded to 2 decimals, within the generic
// 0.05 answer tolerance. Tiers 1-2: read a ratio off an angle directly.
// Tiers 3-5: an applied "ladder against a wall" word problem using tan.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const angle = rng.int(20, 70);
  const radians = (angle * Math.PI) / 180;

  if (difficultyTier <= 2) {
    const ratioFn = rng.pick(["sin", "cos", "tan"] as const);
    const raw = { sin: Math.sin(radians), cos: Math.cos(radians), tan: Math.tan(radians) }[ratioFn];
    const value = Math.round(raw * 100) / 100;
    return {
      question: { format: "numeric", prompt: `Berechne ${ratioFn}(${angle}°). (Runde auf zwei Nachkommastellen.)` },
      answer: { value },
      solutionSteps: [
        { label: "Taschenrechner", expression: `${ratioFn}(${angle}°)` },
        { label: "Ergebnis (gerundet)", expression: `${value}` },
      ],
    };
  }

  const adjacent = rng.int(5, 10 + difficultyTier);
  const opposite = Math.round(adjacent * Math.tan(radians) * 100) / 100;
  return {
    question: {
      format: "numeric",
      prompt: `Eine Leiter lehnt im Winkel von ${angle}° an einer Wand. Der Abstand der Leiterfüße zur Wand beträgt ${adjacent} m. Wie hoch reicht die Leiter an der Wand? (Runde auf zwei Nachkommastellen.)`,
    },
    answer: { value: opposite },
    solutionSteps: [
      { label: "Ansatz", expression: "tan(Winkel) = Gegenkathete / Ankathete" },
      { label: "Umstellen", expression: "Gegenkathete = Ankathete · tan(Winkel)" },
      { label: "Einsetzen", expression: `${adjacent} · tan(${angle}°) = ${opposite}` },
    ],
  };
}
