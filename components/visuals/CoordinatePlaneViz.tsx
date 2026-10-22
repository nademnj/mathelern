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
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={toX(p.x)} cy={toY(p.y)} r={5} className="fill-primary" />
          {p.label && (
            <text x={toX(p.x) + 8} y={toY(p.y) - 8} className="fill-foreground text-xs">
              {p.label} ({p.x}|{p.y})
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
