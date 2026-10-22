import { generate as fractionsGenerator } from "./fractionsGenerator";
import { generate as decimalsGenerator } from "./decimalsGenerator";
import { generate as geometryAreaGenerator } from "./geometryAreaGenerator";
import { generate as placeValueGenerator } from "./placeValueGenerator";
import { generate as linearEquationGenerator } from "./linearEquationGenerator";
import type { GeneratorFn } from "./types";

export const generatorRegistry: Record<string, GeneratorFn> = {
  fractionsGenerator,
  decimalsGenerator,
  geometryAreaGenerator,
  placeValueGenerator,
  linearEquationGenerator,
};

export type { GeneratedExercise, GeneratedAnswer, SolutionStep, GeneratorArgs } from "./types";
export { isAnswerCorrect } from "./types";
