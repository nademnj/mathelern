export interface AreaGridVizProps {
  width: number;
  height: number;
  unit?: string;
  highlightArea?: boolean;
}

export function AreaGridViz({ width, height, unit = "cm", highlightArea = true }: AreaGridVizProps) {
  const cellSize = 36;
  const svgW = width * cellSize + 60;
  const svgH = height * cellSize + 60;

  const cells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={30 + x * cellSize}
          y={20 + y * cellSize}
          width={cellSize}
          height={cellSize}
          className={highlightArea ? "fill-primary/15 stroke-primary/40" : "fill-muted stroke-border"}
          strokeWidth={1}
        />
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 30}`} className="mx-auto w-full max-w-md" role="img" aria-label="Flächenraster">
      {cells}
      <text x={30 + (width * cellSize) / 2} y={svgH + 20} textAnchor="middle" className="fill-foreground text-sm">
        {width} {unit} × {height} {unit} = {width * height} {unit}²
      </text>
    </svg>
  );
}
