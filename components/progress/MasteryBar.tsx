import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { TopicMasteryStatus } from "@/lib/types/db";

const STATUS_LABEL: Record<TopicMasteryStatus, string> = {
  not_started: "Noch nicht begonnen",
  in_progress: "In Bearbeitung",
  struggling: "Braucht Übung",
  mastered: "Gemeistert",
};

const STATUS_VARIANT: Record<TopicMasteryStatus, "secondary" | "default" | "destructive"> = {
  not_started: "secondary",
  in_progress: "default",
  struggling: "destructive",
  mastered: "default",
};

export function MasteryBar({
  title,
  status,
  masteryScore,
}: {
  title: string;
  status: TopicMasteryStatus;
  masteryScore: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      </div>
      <Progress value={masteryScore} />
    </div>
  );
}
