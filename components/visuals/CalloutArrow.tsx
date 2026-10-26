"use client";

import { useId } from "react";

export interface CalloutArrowProps {
  /** Pixel coords of the feature being pointed at. */
  targetX: number;
  targetY: number;
  /** Pixel coords of the label's text baseline -- keep this outside the
   * shape being annotated (a margin band, a side strip, ...) so the name
   * is never fighting the drawing for visibility. */
  labelX: number;
  labelY: number;
  label: string;
  textAnchor?: "start" | "middle" | "end";
  /** Delay the appearance (e.g. until a motion animation has settled). Plain CSS, no JS dependency. */
  delaySeconds?: number;
}

// Shared "name + arrow pointing at the important part" annotation used
// across the visual components -- a small dot at the feature, a leader
// line with an arrowhead, and a halo'd label so text stays legible no
// matter what it's drawn over.
export function CalloutArrow({
  targetX,
  targetY,
  labelX,
  labelY,
  label,
  textAnchor = "middle",
  delaySeconds = 0,
}: CalloutArrowProps) {
  const arrowId = useId();
  const lineStartY = labelY + (labelY < targetY ? 8 : -8);

  return (
    <g style={{ animation: `callout-fade-in 0.5s ease ${delaySeconds}s both` }}>
      <style>{`@keyframes callout-fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground" />
        </marker>
      </defs>
      <circle cx={targetX} cy={targetY} r={4.5} className="fill-primary" />
      <line
        x1={labelX}
        y1={lineStartY}
        x2={targetX}
        y2={targetY}
        className="stroke-foreground"
        strokeWidth={1.5}
        markerEnd={`url(#${arrowId})`}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        className="fill-foreground text-[11px] font-medium"
        stroke="var(--background)"
        strokeWidth={5}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}
