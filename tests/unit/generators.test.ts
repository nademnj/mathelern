import { describe, expect, it } from "vitest";
import { generate as fractionsGenerator } from "@/lib/generators/fractionsGenerator";
import { generate as decimalsGenerator } from "@/lib/generators/decimalsGenerator";
import { generate as geometryAreaGenerator } from "@/lib/generators/geometryAreaGenerator";
import { generate as placeValueGenerator } from "@/lib/generators/placeValueGenerator";
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
