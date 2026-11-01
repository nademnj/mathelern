import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

const CONTEXTS = [
  { subject: "Autos", categories: ["rot", "blau", "schwarz", "weiß"] },
  { subject: "Eissorten", categories: ["Vanille", "Schokolade", "Erdbeere", "Zitrone"] },
  { subject: "Haustiere", categories: ["Hund", "Katze", "Kaninchen", "keins"] },
] as const;

// Reads values off a small frequency table (like a Strichliste result) and
// asks for the total -- the core "Daten aus einer Tabelle entnehmen" skill.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const context = rng.pick(CONTEXTS);
  const maxCount = [8, 10, 14, 18, 25][Math.min(difficultyTier, 5) - 1];
  const counts = context.categories.map(() => rng.int(1, maxCount));
  const total = counts.reduce((s, c) => s + c, 0);
  const rows = context.categories.map((cat, i) => `${cat}: ${counts[i]}`).join(", ");

  return {
    question: {
      format: "numeric",
      prompt: `Eine Umfrage zu „${context.subject}" ergab: ${rows}. Wie viele Personen wurden insgesamt befragt?`,
    },
    answer: { value: total },
    solutionSteps: [
      { label: "Werte aus der Tabelle", expression: rows },
      { label: "Alle addieren", expression: counts.join(" + ") },
      { label: "Ergebnis", expression: `${total}` },
    ],
  };
}
