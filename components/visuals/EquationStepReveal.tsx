"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface EquationStepRevealProps {
  steps: { label: string; expression: string }[];
}

export function EquationStepReveal({ steps }: EquationStepRevealProps) {
  const [visible, setVisible] = useState(1);

  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="space-y-2 rounded-md border border-border p-4">
        {steps.slice(0, visible).map((step, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">{step.label}</span>
            <span className="font-mono text-base">{step.expression}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={visible <= 1}
          onClick={() => setVisible((v) => Math.max(1, v - 1))}
        >
          Zurück
        </Button>
        <span className="text-xs text-muted-foreground">
          Schritt {visible} von {steps.length}
        </span>
        <Button
          size="sm"
          disabled={visible >= steps.length}
          onClick={() => setVisible((v) => Math.min(steps.length, v + 1))}
        >
          Nächster Schritt
        </Button>
      </div>
    </div>
  );
}
