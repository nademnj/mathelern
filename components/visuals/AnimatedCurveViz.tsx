"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";

export interface AnimatedCurveVizProps {
  curveType: "quadratic" | "linear" | "exponential" | "circular";
  a?: number;
  b?: number;
  c?: number;
  m?: number;
  t?: number;
  base?: number;
  initial?: number;
  xMin?: number;
  xMax?: number;
  radius?: number;
  startAngleDeg?: number;
  sweepDeg?: number;
  mover?: string;
  label?: string;
  /** Labels the parabola's vertex with an arrow once the animation settles (quadratic curves only). */
  markVertex?: string;
}

const SAMPLES = 48;
const DURATION = 2.6;
const SIZE = 320;
const PAD = 26;

function evaluate(props: AnimatedCurveVizProps, x: number): number {
  switch (props.curveType) {
    case "quadratic":
      return (props.a ?? 1) * x * x + (props.b ?? 0) * x + (props.c ?? 0);
    case "linear":
      return (props.m ?? 1) * x + (props.t ?? 0);
    case "exponential":
      return (props.initial ?? 1) * Math.pow(props.base ?? 2, x);
    default:
      return 0;
  }
}

function samplePoints(props: AnimatedCurveVizProps): { x: number; y: number }[] {
  if (props.curveType === "circular") {
    const radius = props.radius ?? 1;
    const start = props.startAngleDeg ?? 0;
    const sweep = props.sweepDeg ?? 360;
    return Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const deg = start + (sweep * i) / SAMPLES;
      const rad = (deg * Math.PI) / 180;
      return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
    });
  }
  const xMin = props.xMin ?? -5;
  const xMax = props.xMax ?? 5;
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const x = xMin + ((xMax - xMin) * i) / SAMPLES;
    return { x, y: evaluate(props, x) };
  });
}

function niceStep(span: number, targetCount: number): number {
  if (span <= 0) return 1;
  const raw = span / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const res = raw / mag;
  const mult = res > 5 ? 10 : res > 2 ? 5 : res > 1 ? 2 : 1;
  return mult * mag;
}

function ticksFor(lo: number, hi: number, targetCount = 5): number[] {
  const step = niceStep(hi - lo, targetCount);
  const start = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step * 1e-6; v += step) {
    out.push(Math.abs(v) < step / 1e6 ? 0 : Math.round(v / step) * step);
  }
  return out;
}

function formatTick(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// A real-world example made literal: a mover (ball, car, bacterium, a point
// on the unit circle...) actually travels along the function's graph while
// the curve draws itself in sync -- the "animated video" moment, built as
// real browser motion (precise math, instant, free) instead of a generated
// video file. Axis bounds are derived from the actual curve data so this
// works for wildly different scales (a ball's arc vs. bacteria counts)
// without per-lesson tuning.
export function AnimatedCurveViz(props: AnimatedCurveVizProps) {
  const { mover = "⚽", label, markVertex } = props;
  const [replayKey, setReplayKey] = useState(0);
  const arrowId = useId();

  const points = samplePoints(props);
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);

  const xLo = Math.min(0, ...xValues);
  const xHi = Math.max(0, ...xValues);
  const yLo = Math.min(0, ...yValues);
  const yHi = Math.max(0, ...yValues);
  const xPad = (xHi - xLo) * 0.12 || 1;
  const yPad = (yHi - yLo) * 0.12 || 1;
  const xDomain: [number, number] = [xLo - xPad, xHi + xPad];
  const yDomain: [number, number] = [yLo - yPad, yHi + yPad];

  const plotSize = SIZE - PAD * 2;
  const toX = (x: number) => PAD + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotSize;
  const toY = (y: number) => PAD + plotSize - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotSize;

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");
  const xTicks = ticksFor(xDomain[0], xDomain[1]);
  const yTicks = ticksFor(yDomain[0], yDomain[1]);

  // Vertex of a quadratic (x = -b/2a) -- computed, not hand-tuned per lesson,
  // so it always matches a/b/c exactly.
  const vertex =
    props.curveType === "quadratic" && markVertex
      ? (() => {
          const a = props.a ?? 1;
          const b = props.b ?? 0;
          const vx = -b / (2 * a);
          return { x: vx, y: evaluate(props, vx), opensUp: a > 0 };
        })()
      : null;
  const vPx = vertex ? toX(vertex.x) : 0;
  const vPy = vertex ? toY(vertex.y) : 0;
  const labelGap = 14;
  const labelOffset = 42;
  const labelAnchorY = vertex
    ? vertex.opensUp
      ? Math.max(PAD + 8, vPy - labelOffset)
      : Math.min(PAD + plotSize - 8, vPy + labelOffset)
    : 0;
  const lineStartY = vertex ? (vertex.opensUp ? labelAnchorY + labelGap : labelAnchorY - labelGap) : 0;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-sm" role="img" aria-label={label ?? "Animierte Kurve"}>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-foreground" />
          </marker>
        </defs>
        {xTicks.map((v) => (
          <g key={`x-${v}`}>
            <line x1={toX(v)} y1={PAD} x2={toX(v)} y2={PAD + plotSize} className="stroke-border/40" />
            <text x={toX(v)} y={PAD + plotSize + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {formatTick(v)}
            </text>
          </g>
        ))}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
            <line x1={PAD} y1={toY(v)} x2={PAD + plotSize} y2={toY(v)} className="stroke-border/40" />
            <text x={PAD - 6} y={toY(v) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
              {formatTick(v)}
            </text>
          </g>
        ))}
        <line x1={PAD} y1={toY(0)} x2={PAD + plotSize} y2={toY(0)} className="stroke-border" strokeWidth={1.5} />
        <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={PAD + plotSize} className="stroke-border" strokeWidth={1.5} />

        <motion.path
          key={`path-${replayKey}`}
          d={d}
          className="fill-none stroke-primary"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: DURATION, ease: "linear" }}
        />

        <motion.text
          key={`mover-${replayKey}`}
          initial={{ x: toX(points[0].x), y: toY(points[0].y) }}
          animate={{ x: points.map((p) => toX(p.x)), y: points.map((p) => toY(p.y)) }}
          transition={{ duration: DURATION, ease: "linear" }}
          fontSize={20}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {mover}
        </motion.text>

        {vertex && (
          <motion.g
            key={`vertex-${replayKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: DURATION + 0.3, duration: 0.5 }}
          >
            <circle cx={vPx} cy={vPy} r={4.5} className="fill-primary" />
            <line
              x1={vPx}
              y1={lineStartY}
              x2={vPx}
              y2={vPy}
              className="stroke-foreground"
              strokeWidth={1.5}
              markerEnd={`url(#${arrowId})`}
            />
            <text
              x={vPx}
              y={vertex.opensUp ? labelAnchorY - 6 : labelAnchorY + 14}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
              stroke="var(--background)"
              strokeWidth={5}
              paintOrder="stroke"
            >
              {markVertex}
            </text>
          </motion.g>
        )}
      </svg>

      {label && <p className="text-center text-xs text-muted-foreground">{label}</p>}

      <div className="text-center">
        <button
          onClick={() => setReplayKey((k) => k + 1)}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          ▶️ Animation nochmal ansehen
        </button>
      </div>
    </div>
  );
}
