export interface FractionBarVizProps {
  numerator: number;
  denominator: number;
  compareNumerator?: number;
  compareDenominator?: number;
  label?: string;
}

function Bar({ numerator, denominator, caption }: { numerator: number; denominator: number; caption: string }) {
  const cells = Array.from({ length: denominator }, (_, i) => i < numerator);
  return (
    <div className="space-y-2">
      <div className="flex h-14 w-full overflow-hidden rounded-md border border-border">
        {cells.map((filled, i) => (
          <div
            key={i}
            className={`flex-1 border-r border-border last:border-r-0 ${filled ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {caption} = {numerator}/{denominator}
      </p>
    </div>
  );
}

export function FractionBarViz({
  numerator,
  denominator,
  compareNumerator,
  compareDenominator,
  label,
}: FractionBarVizProps) {
  const hasCompare = compareNumerator !== undefined && compareDenominator !== undefined;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Bar numerator={numerator} denominator={denominator} caption={label ?? "Bruch"} />
      {hasCompare && (
        <Bar numerator={compareNumerator!} denominator={compareDenominator!} caption="Vergleich" />
      )}
    </div>
  );
}
