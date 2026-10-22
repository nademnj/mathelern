import { createClient } from "@/lib/supabase/server";
import { requireParent } from "@/lib/auth/roles";
import { getGrade } from "@/lib/curriculum/getGrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildSummaryCard } from "@/components/parent/ChildSummaryCard";
import { LinkChildForm } from "@/components/parent/LinkChildForm";

export default async function ParentDashboardPage() {
  const { profile } = await requireParent();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("parent_child_links")
    .select("student_id")
    .eq("status", "approved");

  const children = await Promise.all(
    (links ?? []).map(async (link) => {
      const [{ data: childProfile }, { data: student }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", link.student_id).single(),
        supabase.from("students").select("grade_level, school_track").eq("id", link.student_id).single(),
      ]);
      const gradeLevel = student?.grade_level ?? 5;
      const grade = await getGrade(supabase, gradeLevel, student?.school_track ?? "gymnasium_g9");

      const [{ data: topics }, { data: masteryRows }] = await Promise.all([
        supabase.from("topics").select("id").eq("is_published", true).eq("grade_id", grade?.id ?? ""),
        supabase.from("topic_mastery").select("status").eq("student_id", link.student_id),
      ]);

      const topicsInGrade = (topics ?? []).length;
      const masteredCount = (masteryRows ?? []).filter((m) => m.status === "mastered").length;

      return {
        studentId: link.student_id,
        displayName: childProfile?.display_name ?? "Unbekannt",
        gradeLevel,
        topicCount: topicsInGrade,
        masteredCount,
        overallPercent: topicsInGrade > 0 ? Math.round((masteredCount / topicsInGrade) * 100) : 0,
      };
    })
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Willkommen, {profile.display_name}!</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kind verknüpfen</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkChildForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deine Kinder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {children.length > 0 ? (
            children.map((child) => <ChildSummaryCard key={child.studentId} {...child} />)
          ) : (
            <p className="text-sm text-muted-foreground">
              Noch kein Kind verknüpft. Gib oben den Einladungscode deines Kindes ein.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
