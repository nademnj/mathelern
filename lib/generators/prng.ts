// Deterministic PRNG (mulberry32) so a {generator_key, seed} pair always
// reproduces the exact same question — needed for exercise_instances audit/replay.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

export function makeRng(seed: number): Rng {
  const rand = mulberry32(seed);
  return {
    next: rand,
    int: (min, max) => min + Math.floor(rand() * (max - min + 1)),
    pick: (items) => items[Math.floor(rand() * items.length)],
  };
}
