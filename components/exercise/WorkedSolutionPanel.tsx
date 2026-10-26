import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkedSolutionPanel({ steps }: { steps: { label: string; expression: string }[] }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm">Lösungsweg</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{step.label}</span>
            <span className="whitespace-pre-line rounded bg-accent px-1.5 py-0.5 text-right font-mono text-accent-foreground">
              {step.expression}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
