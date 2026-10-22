import { describe, expect, it } from "vitest";
import { applyAttempt, defaultMasteryState } from "@/lib/adaptive/masteryModel";

describe("applyAttempt", () => {
  it("climbs a tier after 2 consecutive correct answers", () => {
    let state = defaultMasteryState();
    state = applyAttempt(state, { isCorrect: true, firstTry: true });
    expect(state.lastDifficultyTier).toBe(1);
    state = applyAttempt(state, { isCorrect: true, firstTry: true });
    expect(state.lastDifficultyTier).toBe(2);
    expect(state.consecutiveCorrect).toBe(0);
  });

  it("drops a tier after 2 consecutive incorrect answers", () => {
    let state = defaultMasteryState();
    state = applyAttempt(state, { isCorrect: true, firstTry: true });
    state = applyAttempt(state, { isCorrect: true, firstTry: true }); // tier 2
    state = applyAttempt(state, { isCorrect: false, firstTry: false });
    expect(state.lastDifficultyTier).toBe(2);
    state = applyAttempt(state, { isCorrect: false, firstTry: false });
    expect(state.lastDifficultyTier).toBe(1);
  });

  it("never drops below tier 1 or climbs above tier 5", () => {
    let state = defaultMasteryState();
    for (let i = 0; i < 2; i++) {
      state = applyAttempt(state, { isCorrect: false, firstTry: false });
    }
    expect(state.lastDifficultyTier).toBe(1);

    state = defaultMasteryState();
    state.lastDifficultyTier = 5;
    for (let i = 0; i < 4; i++) {
      state = applyAttempt(state, { isCorrect: true, firstTry: true });
    }
    expect(state.lastDifficultyTier).toBe(5);
  });

  it("flags struggling after 3 consecutive incorrect answers", () => {
    let state = defaultMasteryState();
    for (let i = 0; i < 2; i++) {
      state = applyAttempt(state, { isCorrect: false, firstTry: false });
    }
    expect(state.status).not.toBe("struggling");
    state = applyAttempt(state, { isCorrect: false, firstTry: false });
    expect(state.status).toBe("struggling");
  });

  it("resets the incorrect streak and clears struggling on a correct answer", () => {
    let state = defaultMasteryState();
    for (let i = 0; i < 3; i++) {
      state = applyAttempt(state, { isCorrect: false, firstTry: false });
    }
    expect(state.status).toBe("struggling");
    state = applyAttempt(state, { isCorrect: true, firstTry: true });
    expect(state.consecutiveIncorrect).toBe(0);
    expect(state.status).not.toBe("struggling");
  });

  it("reaches mastered once score >= 80 and tier >= 4", () => {
    let state = defaultMasteryState();
    // Climb tiers with first-try corrects until mastered.
    for (let i = 0; i < 20 && state.status !== "mastered"; i++) {
      state = applyAttempt(state, { isCorrect: true, firstTry: true });
    }
    expect(state.status).toBe("mastered");
    expect(state.masteryScore).toBeGreaterThanOrEqual(80);
    expect(state.lastDifficultyTier).toBeGreaterThanOrEqual(4);
  });

  it("never lets masteryScore leave the [0, 100] range", () => {
    let state = defaultMasteryState();
    for (let i = 0; i < 50; i++) {
      state = applyAttempt(state, { isCorrect: false, firstTry: false });
    }
    expect(state.masteryScore).toBe(0);

    state = defaultMasteryState();
    for (let i = 0; i < 50; i++) {
      state = applyAttempt(state, { isCorrect: true, firstTry: true });
    }
    expect(state.masteryScore).toBeLessThanOrEqual(100);
  });
});
