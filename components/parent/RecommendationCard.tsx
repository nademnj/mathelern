"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dismissRecommendation } from "@/actions/parentLinks";
import type { RecommendationSeverity } from "@/lib/types/db";

const SEVERITY_VARIANT: Record<RecommendationSeverity, "secondary" | "default" | "destructive"> = {
  info: "secondary",
  suggested: "default",
  priority: "destructive",
};

const SEVERITY_LABEL: Record<RecommendationSeverity, string> = {
  info: "Info",
  suggested: "Empfehlung",
  priority: "Wichtig",
};

export function RecommendationCard({
  id,
  message,
  severity,
}: {
  id: string;
  message: string;
  severity: RecommendationSeverity;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-1.5">
          <Badge variant={SEVERITY_VARIANT[severity]}>{SEVERITY_LABEL[severity]}</Badge>
          <p className="text-sm">{message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(async () => {
            await dismissRecommendation(id);
            router.refresh();
          })}
        >
          Erledigt
        </Button>
      </CardContent>
    </Card>
  );
}
