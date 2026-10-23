export interface GeneratedQuestion {
  prompt: string;
  format: "numeric" | "fraction" | "text";
}

export interface GeneratedAnswer {
  value?: number;
  numerator?: number;
  denominator?: number;
  text?: string;
}

export interface SolutionStep {
  label: string;
  expression: string;
}

export interface GeneratedExercise {
  question: GeneratedQuestion;
  answer: GeneratedAnswer;
  solutionSteps: SolutionStep[];
}

export type GeneratorArgs = { difficultyTier: number; seed: number };
export type GeneratorFn = (args: GeneratorArgs) => GeneratedExercise;

/** True if a submitted answer matches the generated answer (loose numeric tolerance). */
export function isAnswerCorrect(submitted: GeneratedAnswer, expected: GeneratedAnswer): boolean {
  if (expected.numerator !== undefined && expected.denominator !== undefined) {
    return submitted.numerator === expected.numerator && submitted.denominator === expected.denominator;
  }
  if (expected.value !== undefined) {
    // Wide enough to absorb a student's own pi/calculator rounding (e.g.
    // sphereGenerator's surface/volume answers) without weakening exact
    // integer checks in any meaningful way.
    return typeof submitted.value === "number" && Math.abs(submitted.value - expected.value) < 0.05;
  }
  if (expected.text !== undefined) {
    return submitted.text?.trim().toLowerCase() === expected.text.trim().toLowerCase();
  }
  return false;
}
