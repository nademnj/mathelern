export interface TreeDiagramVizProps {
  branches: { label: string; probability: string }[];
  /** Same options repeat at the second draw (e.g. "mit Zurücklegen"). */
  secondBranches: { label: string; probability: string }[];
  /** Highlights the path this exercise is asking about, e.g. ["rot", "blau"]. */
  highlightPath?: [string, string];
}

export function TreeDiagramViz({ branches, secondBranches, highlightPath }: TreeDiagramVizProps) {
  const rootX = 30;
  const rootY = 110;
  const level1X = 150;
  const level2X = 280;

  const level1Y = branches.map((_, i) => 40 + i * ((220 - 80) / Math.max(1, branches.length - 1 || 1)));
  const perGroup = 220 / (branches.length * secondBranches.length);

  return (
    <svg viewBox="0 0 340 220" className="mx-auto w-full max-w-md" role="img" aria-label="Baumdiagramm">
      {branches.map((b1, i) => {
        const y1 = branches.length === 1 ? rootY : level1Y[i];
        const isHighlighted1 = highlightPath?.[0] === b1.label;
        return (
          <g key={b1.label}>
            <line
              x1={rootX}
              y1={rootY}
              x2={level1X}
              y2={y1}
              className={isHighlighted1 ? "stroke-primary" : "stroke-border"}
              strokeWidth={isHighlighted1 ? 2.5 : 1.5}
            />
            <text x={(rootX + level1X) / 2} y={(rootY + y1) / 2 - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {b1.probability}
            </text>
            <text x={level1X + 6} y={y1 - 8} className="fill-foreground text-[11px]">
              {b1.label}
            </text>
            {secondBranches.map((b2, j) => {
              const leafIndex = i * secondBranches.length + j;
              const y2 = 20 + leafIndex * perGroup + perGroup / 2;
              const isHighlighted2 = isHighlighted1 && highlightPath?.[1] === b2.label;
              return (
                <g key={b2.label}>
                  <line
                    x1={level1X}
                    y1={y1}
                    x2={level2X}
                    y2={y2}
                    className={isHighlighted2 ? "stroke-primary" : "stroke-border"}
                    strokeWidth={isHighlighted2 ? 2.5 : 1.5}
                  />
                  <text x={(level1X + level2X) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                    {b2.probability}
                  </text>
                  <text x={level2X + 6} y={y2 + 4} className="fill-foreground text-[11px]">
                    {b2.label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <circle cx={rootX} cy={rootY} r={3} className="fill-foreground" />
    </svg>
  );
}
