import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ChildSummaryCard({
  studentId,
  displayName,
  gradeLevel,
  overallPercent,
  topicCount,
  masteredCount,
}: {
  studentId: string;
  displayName: string;
  gradeLevel: number;
  overallPercent: number;
  topicCount: number;
  masteredCount: number;
}) {
  return (
    <Link href={`/parent/child/${studentId}`}>
      <Card className="transition-colors hover:bg-muted">
        <CardHeader>
          <CardTitle>
            {displayName} · {gradeLevel}. Klasse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={overallPercent} />
          <p className="text-sm text-muted-foreground">
            {masteredCount} von {topicCount} Themen gemeistert ({overallPercent}%)
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
