import { CalloutArrow } from "./CalloutArrow";

export interface CoordinatePlaneVizProps {
  range?: number;
  points?: { x: number; y: number; label?: string }[];
}

export function CoordinatePlaneViz({ range = 10, points = [] }: CoordinatePlaneVizProps) {
  const size = 320;
  const scale = size / (range * 2);
  const toX = (x: number) => size / 2 + x * scale;
  const toY = (y: number) => size / 2 - y * scale;

  const ticks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range).filter((v) => v !== 0);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-sm" role="img" aria-label="Koordinatensystem">
      {ticks.map((v) => (
        <g key={`v-${v}`}>
          <line x1={toX(v)} y1={toY(0) - 3} x2={toX(v)} y2={toY(0) + 3} className="stroke-border" />
          <line x1={toX(0) - 3} y1={toY(v)} x2={toX(0) + 3} y2={toY(v)} className="stroke-border" />
        </g>
      ))}
      <line x1={0} y1={toY(0)} x2={size} y2={toY(0)} className="stroke-border" strokeWidth={1.5} />
      <line x1={toX(0)} y1={0} x2={toX(0)} y2={size} className="stroke-border" strokeWidth={1.5} />
      {points.map((p, i) => {
        const px = toX(p.x);
        const py = toY(p.y);
        if (!p.label) {
          return <circle key={i} cx={px} cy={py} r={5} className="fill-primary" />;
        }
        // Push the label out and away from the origin so it sits clear of
        // the axes and any curve through this point, not right on top of it.
        const dirX = p.x >= 0 ? 1 : -1;
        const dirY = p.y >= 0 ? -1 : 1;
        const labelX = Math.min(Math.max(px + dirX * 36, 30), size - 30);
        const labelY = Math.min(Math.max(py + dirY * 24, 14), size - 10);
        return (
          <CalloutArrow
            key={i}
            targetX={px}
            targetY={py}
            labelX={labelX}
            labelY={labelY}
            label={`${p.label} (${p.x}|${p.y})`}
            textAnchor={dirX > 0 ? "start" : "end"}
          />
        );
      })}
    </svg>
  );
}
