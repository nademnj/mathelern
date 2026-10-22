import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder for Phase 4 (grading UI, milestones, GradeRoadmap/MasteryBar).
export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Fortschritt</h1>
      <Card>
        <CardHeader>
          <CardTitle>Noch keine Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Schließe deine ersten Lektionen ab, um hier deinen Fortschritt zu
            sehen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
