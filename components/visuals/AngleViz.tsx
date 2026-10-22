export interface AngleVizProps {
  degrees: number;
  label?: string;
}

export function AngleViz({ degrees, label }: AngleVizProps) {
  const size = 200;
  const cx = size / 2;
  const cy = size - 10;
  const r = size - 40;
  const rad = (degrees * Math.PI) / 180;
  const x2 = cx + r * Math.cos(Math.PI - rad);
  const y2 = cy - r * Math.sin(Math.PI - rad);

  const largeArc = degrees > 180 ? 1 : 0;
  const arcR = 40;
  const arcX = cx + arcR * Math.cos(Math.PI - rad);
  const arcY = cy - arcR * Math.sin(Math.PI - rad);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[220px]" role="img" aria-label={`Winkel ${degrees} Grad`}>
      <line x1={cx - r} y1={cy} x2={cx} y2={cy} className="stroke-border" strokeWidth={2} />
      <line x1={cx} y1={cy} x2={x2} y2={y2} className="stroke-primary" strokeWidth={2} />
      <path
        d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcX} ${arcY}`}
        className="fill-none stroke-primary/60"
        strokeWidth={1.5}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-sm">
        {label ?? `${degrees}°`}
      </text>
    </svg>
  );
}
