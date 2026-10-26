import type { ReactNode } from "react";

// Scans prose for math-notation tokens (equations, function notation,
// exponents, fractions, coordinate pairs...) and wraps runs of them in a
// highlighted chip, so a formula visually jumps out of a sentence instead
// of blending into regular text. Works on any already-authored narration
// without needing lesson content to mark formulas up by hand.
function isFormulaToken(token: string): boolean {
  // Operators, relations and set/logic symbols actually used across the
  // lesson content (derived from a scan of content/lessons/**).
  if (/[=·×÷√±≈≠→↔⟺∩∪∞°^]/.test(token)) return true;
  if (/[²³⁰¹⁴⁵⁶⁷⁸⁹⁺⁻ᵐⁿ]/.test(token)) return true; // superscripts/exponents
  if (/[₀₁₂₃₄₅₆₇₈₉ₖ]/.test(token)) return true; // subscripts
  if (/[απβγδθλμσφωΑΒΓΔΘΛΣΦΩ]/.test(token)) return true; // Greek math variables
  if (/^[A-Za-z]{1,2}'{0,2}\(/.test(token)) return true; // f(x), f'(x), g(2
  if (/^[A-Za-z]_[A-Za-z0-9]/.test(token)) return true; // x_s, a_n
  if (/^-?\d+[A-Za-z]+\d*$/.test(token)) return true; // 2x, -3y
  if (/^[A-Za-z]+\d+$/.test(token)) return true; // x2
  if (/^\d+\/\d+[.,;:]?$/.test(token)) return true; // 3/4
  if (/\([^)]*[|,][^)]*\)/.test(token)) return true; // (2|5), S(2|-3)
  return false;
}

export function FormulaText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\s+)/);
  const nodes: ReactNode[] = [];
  let buffer: string[] = [];

  function flushBuffer() {
    if (buffer.length === 0) return;
    nodes.push(
      <span
        key={nodes.length}
        className="whitespace-pre-wrap rounded bg-accent px-1 py-0.5 font-mono text-[0.92em] text-accent-foreground"
      >
        {buffer.join("")}
      </span>
    );
    buffer = [];
  }

  for (const part of parts) {
    if (part === "") continue;
    const isSpace = /^\s+$/.test(part);
    if (isSpace) {
      if (buffer.length > 0) buffer.push(part);
      else nodes.push(part);
      continue;
    }
    if (isFormulaToken(part)) {
      buffer.push(part);
    } else {
      flushBuffer();
      nodes.push(part);
    }
  }
  flushBuffer();

  return <span className={className}>{nodes}</span>;
}
