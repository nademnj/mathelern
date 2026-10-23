import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/roles";
import { getGrade } from "@/lib/curriculum/getGrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeRoadmap, type RoadmapTopic } from "@/components/progress/GradeRoadmap";

export default async function StudentDashboardPage() {
  const { profile, student } = await requireStudent();
  const supabase = await createClient();

  const grade = await getGrade(supabase, student?.grade_level ?? 5, student?.school_track ?? "gymnasium_g9");

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">
        Willkommen, {profile.display_name}!
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{grade?.label ?? `${student?.grade_level}. Klasse`} – Lektionen wählen</CardTitle>
        </CardHeader>
        <CardContent>
          {roadmapTopics.length > 0 ? (
            <GradeRoadmap topics={roadmapTopics} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Für deine Klasse sind noch keine Lektionen veröffentlicht. Schau
              bald wieder vorbei!
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Einladungscode für Eltern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gib diesen Code deinen Eltern, damit sie deinen Fortschritt sehen können:
          </p>
          <p className="mt-2 font-mono text-2xl tracking-widest">{student?.invite_code}</p>
        </CardContent>
      </Card>
    </div>
  );
}
