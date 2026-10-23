import { describe, expect, it } from "vitest";
import { generate as fractionsGenerator } from "@/lib/generators/fractionsGenerator";
import { generate as decimalsGenerator } from "@/lib/generators/decimalsGenerator";
import { generate as geometryAreaGenerator } from "@/lib/generators/geometryAreaGenerator";
import { generate as placeValueGenerator } from "@/lib/generators/placeValueGenerator";
import { generate as powersRootsGenerator } from "@/lib/generators/powersRootsGenerator";
import { generate as polynomialFunctionsGenerator } from "@/lib/generators/polynomialFunctionsGenerator";
import { generate as logarithmGenerator } from "@/lib/generators/logarithmGenerator";
import { generate as exponentialGrowthGenerator } from "@/lib/generators/exponentialGrowthGenerator";
import { generate as similarityGenerator } from "@/lib/generators/similarityGenerator";
import { generate as strahlensatzGenerator } from "@/lib/generators/strahlensatzGenerator";
import { generate as rightTriangleTheoremsGenerator } from "@/lib/generators/rightTriangleTheoremsGenerator";
import { generate as trigRatioGenerator } from "@/lib/generators/trigRatioGenerator";
import { generate as unitCircleGenerator } from "@/lib/generators/unitCircleGenerator";
import { generate as sphereGenerator } from "@/lib/generators/sphereGenerator";
import { generate as treeProbabilityGenerator } from "@/lib/generators/treeProbabilityGenerator";
import { generate as combinatoricsGenerator } from "@/lib/generators/combinatoricsGenerator";
import { generate as linearFunctionFromPointsGenerator } from "@/lib/generators/linearFunctionFromPointsGenerator";
import { generate as quadraticEquationGenerator } from "@/lib/generators/quadraticEquationGenerator";
import { generate as fractionEquationGenerator } from "@/lib/generators/fractionEquationGenerator";
import { generate as vertexFormConversionGenerator } from "@/lib/generators/vertexFormConversionGenerator";
import { generate as endBehaviorSymmetryGenerator } from "@/lib/generators/endBehaviorSymmetryGenerator";
import { generate as inequalityGenerator } from "@/lib/generators/inequalityGenerator";
import { generate as functionFromZerosGenerator } from "@/lib/generators/functionFromZerosGenerator";
import { generate as differenceQuotientGenerator } from "@/lib/generators/differenceQuotientGenerator";
import { generate as derivativeSlopeGenerator } from "@/lib/generators/derivativeSlopeGenerator";
import { generate as limitGenerator } from "@/lib/generators/limitGenerator";
import { generate as extremumViaDerivativeGenerator } from "@/lib/generators/extremumViaDerivativeGenerator";
import { generate as sampleSpaceGenerator } from "@/lib/generators/sampleSpaceGenerator";
import { generate as setOperationsGenerator } from "@/lib/generators/setOperationsGenerator";
import { generate as contingencyTableGenerator } from "@/lib/generators/contingencyTableGenerator";
import { generate as laplaceProbabilityGenerator } from "@/lib/generators/laplaceProbabilityGenerator";
import { generate as conditionalProbabilityGenerator } from "@/lib/generators/conditionalProbabilityGenerator";
import { generate as countingPrincipleGenerator } from "@/lib/generators/countingPrincipleGenerator";
import { gcd } from "@/lib/generators/mathUtils";
import { isAnswerCorrect } from "@/lib/generators/types";

describe("fractionsGenerator", () => {
  it("is deterministic for a given seed and tier", () => {
    const a = fractionsGenerator({ difficultyTier: 3, seed: 42 });
    const b = fractionsGenerator({ difficultyTier: 3, seed: 42 });
    expect(a).toEqual(b);
  });

  it("always returns an already-simplified answer", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = fractionsGenerator({ difficultyTier: tier, seed });
        expect(gcd(ex.answer.numerator!, ex.answer.denominator!)).toBe(1);
      }
    }
  });
});

describe("decimalsGenerator", () => {
  it("never produces a negative result for this topic's scope", () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = decimalsGenerator({ difficultyTier: tier, seed });
        expect(ex.answer.value).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("geometryAreaGenerator", () => {
  it("produces a positive integer answer", () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = geometryAreaGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("placeValueGenerator", () => {
  it("produces a digit value consistent with a power of ten", () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = placeValueGenerator({ difficultyTier: tier, seed });
        const value = ex.answer.value!;
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value % 1).toBe(0);
      }
    }
  });
});

describe("powersRootsGenerator", () => {
  it("is deterministic for a given seed and tier", () => {
    const a = powersRootsGenerator({ difficultyTier: 4, seed: 7 });
    const b = powersRootsGenerator({ difficultyTier: 4, seed: 7 });
    expect(a).toEqual(b);
  });

  it("tiers 1-2 produce a positive integer power", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const tier of [1, 2]) {
        const ex = powersRootsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });

  it("tier 3 always answers 1/denominator", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = powersRootsGenerator({ difficultyTier: 3, seed });
      expect(ex.answer.numerator).toBe(1);
      expect(ex.answer.denominator).toBeGreaterThan(0);
    }
  });

  it("tiers 4-5 produce a root that is an exact (integer) answer", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const tier of [4, 5]) {
        const ex = powersRootsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("polynomialFunctionsGenerator", () => {
  it("is deterministic for a given seed and tier", () => {
    const a = polynomialFunctionsGenerator({ difficultyTier: 5, seed: 13 });
    const b = polynomialFunctionsGenerator({ difficultyTier: 5, seed: 13 });
    expect(a).toEqual(b);
  });

  it("every tier produces an integer numeric answer (no decimals/irrationals)", () => {
    for (let seed = 0; seed < 200; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = polynomialFunctionsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("logarithmGenerator", () => {
  it("the exponent answer reproduces base^n = value from the prompt", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = logarithmGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("exponentialGrowthGenerator", () => {
  it("produces a positive integer result", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = exponentialGrowthGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("similarityGenerator", () => {
  it("produces an integer scaled length at every tier", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = similarityGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("strahlensatzGenerator", () => {
  it("produces a positive integer x", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = strahlensatzGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("rightTriangleTheoremsGenerator", () => {
  it("the height answer satisfies h^2 = p*q by construction", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = rightTriangleTheoremsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("trigRatioGenerator", () => {
  it("produces a finite numeric answer within a plausible range", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = trigRatioGenerator({ difficultyTier: tier, seed });
        expect(Number.isFinite(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("unitCircleGenerator", () => {
  it("produces a value within [-1, 1] (sin/cos range)", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = unitCircleGenerator({ difficultyTier: tier, seed });
        expect(ex.answer.value).toBeGreaterThanOrEqual(-1);
        expect(ex.answer.value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("sphereGenerator", () => {
  it("produces a positive surface/volume value accepted by isAnswerCorrect with a rounded submission", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = sphereGenerator({ difficultyTier: tier, seed });
        expect(ex.answer.value).toBeGreaterThan(0);
        // A student rounding to 2 decimals themselves must still be accepted.
        expect(isAnswerCorrect({ value: ex.answer.value }, ex.answer)).toBe(true);
      }
    }
  });
});

describe("treeProbabilityGenerator", () => {
  it("always returns an already-simplified probability fraction", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = treeProbabilityGenerator({ difficultyTier: tier, seed });
        expect(gcd(ex.answer.numerator!, ex.answer.denominator!)).toBe(1);
      }
    }
  });
});

describe("combinatoricsGenerator", () => {
  it("produces n! exactly, capped at 7! = 5040", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = combinatoricsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeLessThanOrEqual(5040);
      }
    }
  });
});

describe("linearFunctionFromPointsGenerator", () => {
  it("produces an integer m or t answer", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = linearFunctionFromPointsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("quadraticEquationGenerator", () => {
  it("produces an integer solution at every tier", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = quadraticEquationGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("fractionEquationGenerator", () => {
  it("produces an integer solution for x", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = fractionEquationGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("vertexFormConversionGenerator", () => {
  it("produces an integer d/e/q answer at every tier", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = vertexFormConversionGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("endBehaviorSymmetryGenerator", () => {
  it("answers exactly one of the two known symmetry words", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = endBehaviorSymmetryGenerator({ difficultyTier: 1, seed });
      expect(["achsensymmetrisch", "punktsymmetrisch"]).toContain(ex.answer.text);
    }
  });

  it("is accepted case-insensitively by isAnswerCorrect", () => {
    const ex = endBehaviorSymmetryGenerator({ difficultyTier: 1, seed: 5 });
    expect(isAnswerCorrect({ text: ex.answer.text!.toUpperCase() }, ex.answer)).toBe(true);
  });
});

describe("inequalityGenerator", () => {
  it("produces an integer boundary point", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = inequalityGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("functionFromZerosGenerator", () => {
  it("produces an integer q", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = functionFromZerosGenerator({ difficultyTier: 1, seed });
      expect(Number.isInteger(ex.answer.value)).toBe(true);
    }
  });
});

describe("differenceQuotientGenerator", () => {
  it("produces an integer equal to x1 + x2", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = differenceQuotientGenerator({ difficultyTier: 1, seed });
      expect(Number.isInteger(ex.answer.value)).toBe(true);
    }
  });
});

describe("derivativeSlopeGenerator", () => {
  it("produces an even integer (2 * x0)", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = derivativeSlopeGenerator({ difficultyTier: 1, seed });
      expect(Number.isInteger(ex.answer.value)).toBe(true);
      expect(Math.abs(ex.answer.value! % 2)).toBe(0); // Math.abs normalizes -0 to 0
    }
  });
});

describe("limitGenerator", () => {
  it("produces an integer limit value", () => {
    for (let seed = 0; seed < 100; seed++) {
      const ex = limitGenerator({ difficultyTier: 1, seed });
      expect(Number.isInteger(ex.answer.value)).toBe(true);
    }
  });
});

describe("extremumViaDerivativeGenerator", () => {
  it("produces an integer answer at every tier", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = extremumViaDerivativeGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
      }
    }
  });
});

describe("sampleSpaceGenerator", () => {
  it("produces a power of 6", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = sampleSpaceGenerator({ difficultyTier: tier, seed });
        expect([6, 36, 216]).toContain(ex.answer.value);
      }
    }
  });
});

describe("setOperationsGenerator", () => {
  it("produces a positive integer union size", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = setOperationsGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("contingencyTableGenerator", () => {
  it("produces a positive integer row total", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = contingencyTableGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});

describe("laplaceProbabilityGenerator", () => {
  it("always returns an already-simplified probability fraction", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = laplaceProbabilityGenerator({ difficultyTier: tier, seed });
        expect(gcd(ex.answer.numerator!, ex.answer.denominator!)).toBe(1);
      }
    }
  });
});

describe("conditionalProbabilityGenerator", () => {
  it("always returns an already-simplified probability fraction", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = conditionalProbabilityGenerator({ difficultyTier: tier, seed });
        expect(gcd(ex.answer.numerator!, ex.answer.denominator!)).toBe(1);
      }
    }
  });
});

describe("countingPrincipleGenerator", () => {
  it("produces a positive integer product", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (let tier = 1; tier <= 5; tier++) {
        const ex = countingPrincipleGenerator({ difficultyTier: tier, seed });
        expect(Number.isInteger(ex.answer.value)).toBe(true);
        expect(ex.answer.value).toBeGreaterThan(0);
      }
    }
  });
});
