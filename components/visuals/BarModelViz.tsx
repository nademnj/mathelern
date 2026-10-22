export interface BarModelVizProps {
  total: number;
  parts: { value: number; label: string }[];
  unit?: string;
}

const SHADES = ["bg-primary", "bg-primary/70", "bg-primary/45", "bg-primary/25"];

export function BarModelViz({ total, parts, unit }: BarModelVizProps) {
  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="flex h-12 w-full overflow-hidden rounded-md border border-border">
        {parts.map((p, i) => (
          <div
            key={i}
            style={{ width: `${(p.value / total) * 100}%` }}
            className={`${SHADES[i % SHADES.length]} flex items-center justify-center text-[11px] text-primary-foreground`}
            title={p.label}
          >
            {Math.round((p.value / total) * 100)}%
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {parts.map((p, i) => (
          <li key={i}>
            {p.label}: {p.value}
            {unit ?? ""}
          </li>
        ))}
        <li>Gesamt: {total}{unit ?? ""}</li>
      </ul>
    </div>
  );
}
