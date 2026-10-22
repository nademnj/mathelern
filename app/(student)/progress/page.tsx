import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/roles";
import { getGrade } from "@/lib/curriculum/getGrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GradeRoadmap, type RoadmapTopic } from "@/components/progress/GradeRoadmap";
import { MilestoneBadge } from "@/components/progress/MilestoneBadge";

export default async function ProgressPage() {
  const { student } = await requireStudent();
  const supabase = await createClient();
  const gradeLevel = student?.grade_level ?? 5;

  const grade = await getGrade(supabase, gradeLevel, student?.school_track ?? "gymnasium_g9");

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("grade_id", grade?.id ?? "")
    .order("sequence_order");

  const { data: masteryRows } = await supabase
    .from("topic_mastery")
    .select("*")
    .eq("student_id", student!.id);
  const masteryByTopic = new Map((masteryRows ?? []).map((m) => [m.topic_id, m]));

  const roadmapTopics: RoadmapTopic[] = (topics ?? []).map((t) => {
    const mastery = masteryByTopic.get(t.id);
    return {
      slug: t.slug,
      title: t.title,
      status: mastery?.status ?? "not_started",
      masteryScore: mastery?.mastery_score ?? 0,
    };
  });

  const masteredCount = roadmapTopics.filter((t) => t.status === "mastered").length;
  const overallPercent = roadmapTopics.length > 0 ? Math.round((masteredCount / roadmapTopics.length) * 100) : 0;

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("grade_id", grade?.id ?? "")
    .order("sequence_order");

  const { data: achievedRows } = await supabase
    .from("student_milestones")
    .select("milestone_id")
    .eq("student_id", student!.id);
  const achievedIds = new Set((achievedRows ?? []).map((a) => a.milestone_id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Fortschritt – {grade?.label ?? `${gradeLevel}. Klasse`}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Gesamtfortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={overallPercent} />
          <p className="text-sm text-muted-foreground">
            {masteredCount} von {roadmapTopics.length} Themen gemeistert ({overallPercent}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Themen</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeRoadmap topics={roadmapTopics} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meilensteine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {milestones && milestones.length > 0 ? (
            milestones.map((m) => (
              <MilestoneBadge key={m.id} title={m.title} achieved={achievedIds.has(m.id)} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Meilensteine verfügbar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
