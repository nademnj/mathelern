import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaText } from "@/components/ui/FormulaText";
import type { ExplainedStep } from "@/lib/chat/solutionExplainer";

export function DetailedSolutionPanel({ steps }: { steps: ExplainedStep[] }) {
  return (
    <Card className="border-accent-foreground/20 bg-accent/40">
      <CardHeader>
        <CardTitle className="text-sm">📋 Schritt für Schritt erklärt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm font-semibold">
              {i + 1}. <FormulaText text={step.title} />
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <FormulaText text={step.explanation} />
            </p>
            {step.relatedTopicSlug && (
              <Link
                href={`/topic/${step.relatedTopicSlug}`}
                className="inline-block text-xs text-primary underline hover:no-underline"
              >
                🔗 Hängt zusammen mit: {step.relatedTopicTitle}
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
