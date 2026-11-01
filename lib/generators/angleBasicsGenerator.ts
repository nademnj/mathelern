import { makeRng } from "./prng";
import type { GeneratedExercise, GeneratorArgs } from "./types";

// Supplementary (sum 180°) and complementary (sum 90°) angle pairs -- the
// standard M5 "Winkel" skill of finding a missing angle at a known total.
export function generate({ difficultyTier, seed }: GeneratorArgs): GeneratedExercise {
  const rng = makeRng(seed);
  const useRightAngle = difficultyTier <= 2 ? true : rng.next() < 0.5;
  const total = useRightAngle ? 90 : 180;
  const minKnown = difficultyTier >= 4 ? 5 : 10;
  const known = rng.int(minKnown, total - 5);
  const result = total - known;

  return {
    question: {
      format: "numeric",
      prompt: useRightAngle
        ? `Zwei Winkel ergänzen sich zu einem rechten Winkel (90°). Einer ist ${known}°. Wie groß ist der andere?`
        : `Zwei Winkel liegen nebeneinander auf einer Geraden (180°). Einer ist ${known}°. Wie groß ist der andere?`,
    },
    answer: { value: result },
    solutionSteps: [
      { label: "Gesamtwinkel", expression: `${total}°` },
      { label: "Bekannter Winkel", expression: `${known}°` },
      { label: "Rechnung", expression: `${total}° - ${known}° = ${result}°` },
    ],
  };
}
