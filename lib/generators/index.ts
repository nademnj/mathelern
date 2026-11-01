import { generate as fractionsGenerator } from "./fractionsGenerator";
import { generate as decimalsGenerator } from "./decimalsGenerator";
import { generate as geometryAreaGenerator } from "./geometryAreaGenerator";
import { generate as placeValueGenerator } from "./placeValueGenerator";
import { generate as linearEquationGenerator } from "./linearEquationGenerator";
import { generate as powersRootsGenerator } from "./powersRootsGenerator";
import { generate as polynomialFunctionsGenerator } from "./polynomialFunctionsGenerator";
import { generate as logarithmGenerator } from "./logarithmGenerator";
import { generate as exponentialGrowthGenerator } from "./exponentialGrowthGenerator";
import { generate as similarityGenerator } from "./similarityGenerator";
import { generate as strahlensatzGenerator } from "./strahlensatzGenerator";
import { generate as rightTriangleTheoremsGenerator } from "./rightTriangleTheoremsGenerator";
import { generate as trigRatioGenerator } from "./trigRatioGenerator";
import { generate as unitCircleGenerator } from "./unitCircleGenerator";
import { generate as sphereGenerator } from "./sphereGenerator";
import { generate as treeProbabilityGenerator } from "./treeProbabilityGenerator";
import { generate as combinatoricsGenerator } from "./combinatoricsGenerator";
import { generate as linearFunctionFromPointsGenerator } from "./linearFunctionFromPointsGenerator";
import { generate as quadraticEquationGenerator } from "./quadraticEquationGenerator";
import { generate as fractionEquationGenerator } from "./fractionEquationGenerator";
import { generate as vertexFormConversionGenerator } from "./vertexFormConversionGenerator";
import { generate as endBehaviorSymmetryGenerator } from "./endBehaviorSymmetryGenerator";
import { generate as inequalityGenerator } from "./inequalityGenerator";
import { generate as functionFromZerosGenerator } from "./functionFromZerosGenerator";
import { generate as differenceQuotientGenerator } from "./differenceQuotientGenerator";
import { generate as derivativeSlopeGenerator } from "./derivativeSlopeGenerator";
import { generate as limitGenerator } from "./limitGenerator";
import { generate as extremumViaDerivativeGenerator } from "./extremumViaDerivativeGenerator";
import { generate as sampleSpaceGenerator } from "./sampleSpaceGenerator";
import { generate as setOperationsGenerator } from "./setOperationsGenerator";
import { generate as contingencyTableGenerator } from "./contingencyTableGenerator";
import { generate as laplaceProbabilityGenerator } from "./laplaceProbabilityGenerator";
import { generate as conditionalProbabilityGenerator } from "./conditionalProbabilityGenerator";
import { generate as countingPrincipleGenerator } from "./countingPrincipleGenerator";
import { generate as integerOperationsGenerator } from "./integerOperationsGenerator";
import { generate as divisibilityGenerator } from "./divisibilityGenerator";
import { generate as angleBasicsGenerator } from "./angleBasicsGenerator";
import { generate as solidPropertiesGenerator } from "./solidPropertiesGenerator";
import { generate as unitConversionGenerator } from "./unitConversionGenerator";
import { generate as dataReadingGenerator } from "./dataReadingGenerator";
import { generate as basicArithmeticGenerator } from "./basicArithmeticGenerator";
import { generate as fractionArithmeticGenerator } from "./fractionArithmeticGenerator";
import { generate as rationalNumberGenerator } from "./rationalNumberGenerator";
import { generate as percentageGenerator } from "./percentageGenerator";
import { generate as reflectionSymmetryGenerator } from "./reflectionSymmetryGenerator";
import { generate as polygonAreaGenerator } from "./polygonAreaGenerator";
import { generate as cuboidSurfaceVolumeGenerator } from "./cuboidSurfaceVolumeGenerator";
import { generate as termEvaluationGenerator } from "./termEvaluationGenerator";
import { generate as directProportionGenerator } from "./directProportionGenerator";
import type { GeneratorFn } from "./types";

export const generatorRegistry: Record<string, GeneratorFn> = {
  fractionsGenerator,
  decimalsGenerator,
  geometryAreaGenerator,
  placeValueGenerator,
  linearEquationGenerator,
  powersRootsGenerator,
  polynomialFunctionsGenerator,
  logarithmGenerator,
  exponentialGrowthGenerator,
  similarityGenerator,
  strahlensatzGenerator,
  rightTriangleTheoremsGenerator,
  trigRatioGenerator,
  unitCircleGenerator,
  sphereGenerator,
  treeProbabilityGenerator,
  combinatoricsGenerator,
  linearFunctionFromPointsGenerator,
  quadraticEquationGenerator,
  fractionEquationGenerator,
  vertexFormConversionGenerator,
  endBehaviorSymmetryGenerator,
  inequalityGenerator,
  functionFromZerosGenerator,
  differenceQuotientGenerator,
  derivativeSlopeGenerator,
  limitGenerator,
  extremumViaDerivativeGenerator,
  sampleSpaceGenerator,
  setOperationsGenerator,
  contingencyTableGenerator,
  laplaceProbabilityGenerator,
  conditionalProbabilityGenerator,
  countingPrincipleGenerator,
  integerOperationsGenerator,
  divisibilityGenerator,
  angleBasicsGenerator,
  solidPropertiesGenerator,
  unitConversionGenerator,
  dataReadingGenerator,
  basicArithmeticGenerator,
  fractionArithmeticGenerator,
  rationalNumberGenerator,
  percentageGenerator,
  reflectionSymmetryGenerator,
  polygonAreaGenerator,
  cuboidSurfaceVolumeGenerator,
  termEvaluationGenerator,
  directProportionGenerator,
};

export type { GeneratedExercise, GeneratedAnswer, SolutionStep, GeneratorArgs } from "./types";
export { isAnswerCorrect } from "./types";
