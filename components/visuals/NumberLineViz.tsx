import { CalloutArrow } from "./CalloutArrow";

export interface NumberLineVizProps {
  min: number;
  max: number;
  step?: number;
  highlight?: number[];
  jumpTo?: number;
  /** Names the highlighted (or jumpTo) number with an arrow, so it's clear which one matters. */
  highlightLabel?: string;
}

export function NumberLineViz({ min, max, step = 1, highlight = [], jumpTo, highlightLabel }: NumberLineVizProps) {
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(Number(v.toFixed(5)));

  const width = 600;
  const padding = 30;
  const usable = width - padding * 2;
  const toX = (v: number) => padding + ((v - min) / (max - min)) * usable;

  // Reserve a margin above the line for the callout only when one is asked
  // for, so every existing lesson without a label renders unchanged.
  const topBand = highlightLabel ? 34 : 0;
  const lineY = 50 + topBand;
  const height = 100 + topBand;
  const targetValue = jumpTo ?? highlight[0];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto" role="img" aria-label="Zahlenstrahl">
      <line x1={padding} y1={lineY} x2={width - padding} y2={lineY} className="stroke-border" strokeWidth={2} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={lineY - 6} x2={toX(v)} y2={lineY + 6} className="stroke-border" strokeWidth={2} />
          <text x={toX(v)} y={lineY + 28} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {v}
          </text>
        </g>
      ))}
      {highlight.map((v) => (
        <circle key={v} cx={toX(v)} cy={lineY} r={8} className="fill-primary" />
      ))}
      {jumpTo !== undefined && (
        <circle cx={toX(jumpTo)} cy={lineY} r={11} className="fill-none stroke-primary" strokeWidth={2.5} />
      )}
      {highlightLabel && targetValue !== undefined && (
        <CalloutArrow
          targetX={toX(targetValue)}
          targetY={lineY - (jumpTo !== undefined ? 11 : 8)}
          labelX={Math.min(Math.max(toX(targetValue), 60), width - 60)}
          labelY={16}
          label={highlightLabel}
        />
      )}
    </svg>
  );
}
