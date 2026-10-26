"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface AnimatedCurveVizProps {
  curveType: "quadratic" | "linear" | "exponential";
  a?: number;
  b?: number;
  c?: number;
  m?: number;
  t?: number;
  base?: number;
  initial?: number;
  xMin: number;
  xMax: number;
  range?: number;
  mover?: string;
  label?: string;
}

const SAMPLES = 40;
const DURATION = 2.6;

function evaluate(props: AnimatedCurveVizProps, x: number): number {
  switch (props.curveType) {
    case "quadratic":
      return (props.a ?? 1) * x * x + (props.b ?? 0) * x + (props.c ?? 0);
    case "linear":
      return (props.m ?? 1) * x + (props.t ?? 0);
    case "exponential":
      return (props.initial ?? 1) * Math.pow(props.base ?? 2, x);
  }
}

// A real-world example made literal: a mover (ball, rocket, growing plant...)
// actually travels along the function's graph while the curve draws itself
// in sync -- this is the "animated video" moment, built as real motion
// instead of a generated video file (precise math, instant, free to render).
export function AnimatedCurveViz(props: AnimatedCurveVizProps) {
  const { xMin, xMax, range = 10, mover = "⚽", label } = props;
  const size = 320;
  const scale = size / (range * 2);
  const toX = (x: number) => size / 2 + x * scale;
  const toY = (y: number) => size / 2 - y * scale;

  const [replayKey, setReplayKey] = useState(0);

  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const x = xMin + ((xMax - xMin) * i) / SAMPLES;
    return { x, y: evaluate(props, x) };
  });
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range).filter((v) => v !== 0);

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-sm" role="img" aria-label={label ?? "Animierte Kurve"}>
        {ticks.map((v) => (
          <g key={`t-${v}`}>
            <line x1={toX(v)} y1={toY(0) - 3} x2={toX(v)} y2={toY(0) + 3} className="stroke-border" />
            <line x1={toX(0) - 3} y1={toY(v)} x2={toX(0) + 3} y2={toY(v)} className="stroke-border" />
          </g>
        ))}
        <line x1={0} y1={toY(0)} x2={size} y2={toY(0)} className="stroke-border" strokeWidth={1.5} />
        <line x1={toX(0)} y1={0} x2={toX(0)} y2={size} className="stroke-border" strokeWidth={1.5} />

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
          fontSize={22}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {mover}
        </motion.text>
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
