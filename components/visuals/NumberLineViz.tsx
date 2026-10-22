export interface NumberLineVizProps {
  min: number;
  max: number;
  step?: number;
  highlight?: number[];
  jumpTo?: number;
}

export function NumberLineViz({ min, max, step = 1, highlight = [], jumpTo }: NumberLineVizProps) {
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(Number(v.toFixed(5)));

  const width = 600;
  const padding = 30;
  const usable = width - padding * 2;
  const toX = (v: number) => padding + ((v - min) / (max - min)) * usable;

  return (
    <svg viewBox={`0 0 ${width} 100`} className="w-full max-w-xl mx-auto" role="img" aria-label="Zahlenstrahl">
      <line x1={padding} y1={50} x2={width - padding} y2={50} className="stroke-border" strokeWidth={2} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={44} x2={toX(v)} y2={56} className="stroke-border" strokeWidth={2} />
          <text x={toX(v)} y={78} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {v}
          </text>
        </g>
      ))}
      {highlight.map((v) => (
        <circle key={v} cx={toX(v)} cy={50} r={8} className="fill-primary" />
      ))}
      {jumpTo !== undefined && (
        <circle cx={toX(jumpTo)} cy={50} r={11} className="fill-none stroke-primary" strokeWidth={2.5} />
      )}
    </svg>
  );
}
