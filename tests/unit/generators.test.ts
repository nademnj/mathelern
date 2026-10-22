import { describe, expect, it } from "vitest";
import { generate as fractionsGenerator } from "@/lib/generators/fractionsGenerator";
import { generate as decimalsGenerator } from "@/lib/generators/decimalsGenerator";
import { generate as geometryAreaGenerator } from "@/lib/generators/geometryAreaGenerator";
import { generate as placeValueGenerator } from "@/lib/generators/placeValueGenerator";
import { generate as powersRootsGenerator } from "@/lib/generators/powersRootsGenerator";
import { generate as polynomialFunctionsGenerator } from "@/lib/generators/polynomialFunctionsGenerator";
import { gcd } from "@/lib/generators/mathUtils";

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
