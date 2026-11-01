import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const PERCENT_OPTIONS = [5, 10, 20, 25, 50, 75] as const;
const MODES = ["value", "value", "percent", "base"] as const;

// The three classic percentage questions (Prozentwert, Prozentsatz,
// Grundwert) -- tier controls the numbers' size and, at higher tiers,
// which of the three unknowns is asked.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const grundwert = rng.int(2, [20, 40, 60, 100, 200][Math.min(difficultyTier, 5) - 1]) * 10;
  const prozentsatz = rng.pick(PERCENT_OPTIONS);
  const prozentwert = Math.round((grundwert * prozentsatz) / 100);

  const mode = difficultyTier <= 2 ? "value" : rng.pick(MODES);

  if (mode === "percent") {
    return {
      question: { format: "numeric", prompt: `${prozentwert} von ${grundwert} sind wie viel Prozent?` },
      answer: { value: prozentsatz },
      solutionSteps: [
        { label: "Formel", expression: "Prozentsatz = (Prozentwert / Grundwert) · 100" },
        { label: "Einsetzen", expression: `(${prozentwert} / ${grundwert}) · 100` },
        { label: "Ergebnis", expression: `${prozentsatz} %` },
      ],
    };
  }

  if (mode === "base") {
    return {
      question: { format: "numeric", prompt: `${prozentwert} sind ${prozentsatz} % von welcher Zahl?` },
      answer: { value: grundwert },
      solutionSteps: [
        { label: "Formel", expression: "Grundwert = Prozentwert / Prozentsatz · 100" },
        { label: "Einsetzen", expression: `${prozentwert} / ${prozentsatz} · 100` },
        { label: "Ergebnis", expression: `${grundwert}` },
      ],
    };
  }

  return {
    question: { format: "numeric", prompt: `Wie viel sind ${prozentsatz} % von ${grundwert}?` },
    answer: { value: prozentwert },
    solutionSteps: [
      { label: "Formel", expression: "Prozentwert = Grundwert · Prozentsatz / 100" },
      { label: "Einsetzen", expression: `${grundwert} · ${prozentsatz} / 100` },
      { label: "Ergebnis", expression: `${prozentwert}` },
    ],
  };
}
