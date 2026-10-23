export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export interface MonicQuadratic {
  r1: number;
  r2: number;
  /** y = x^2 + p·x + q */
  p: number;
  q: number;
  /** Vertex is always an integer point since r1/r2 share parity. */
  vertexX: number;
  vertexY: number;
}

/**
 * Picks two integer roots of the same parity (so the vertex x-coordinate
 * (r1+r2)/2 is always a whole number) and builds the monic quadratic
 * y = x^2 + px + q that has exactly those roots. Shared by every generator
 * that needs a quadratic with clean, non-irrational roots/vertex.
 */
export function makeMonicQuadraticFromRoots(
  rng: { int(min: number, max: number): number },
  range: { min: number; max: number } = { min: -6, max: 6 }
): MonicQuadratic {
  const r1 = rng.int(range.min, range.max);
  let r2 = rng.int(range.min, range.max);
  while (r2 === r1 || (r2 - r1) % 2 !== 0) r2 = rng.int(range.min, range.max);
  const p = -(r1 + r2);
  const q = r1 * r2;
  const vertexX = (r1 + r2) / 2;
  const vertexY = vertexX * vertexX + p * vertexX + q;
  return { r1, r2, p, q, vertexX, vertexY };
}

export function formatQuadratic(p: number, q: number): string {
  return `y = x² ${p >= 0 ? "+" : "-"} ${Math.abs(p)}x ${q >= 0 ? "+" : "-"} ${Math.abs(q)}`;
}
