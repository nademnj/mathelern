import type { GeneratedExercise, GeneratorArgs } from "./types";

// Stub for the grade-7 extension ("Terme", linear equations — see plan
// Phase 6). Registered now so lib/generators/index.ts's registry is
// complete; not wired to any topic yet.
export function generate(_args: GeneratorArgs): GeneratedExercise {
  throw new Error("linearEquationGenerator: grade 7 content not yet authored.");
}
