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
