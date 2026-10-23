import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireParent } from "@/lib/auth/roles";
import { getGrade } from "@/lib/curriculum/getGrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MasteryBar } from "@/components/progress/MasteryBar";
import { MilestoneBadge } from "@/components/progress/MilestoneBadge";
import { RecommendationCard } from "@/components/parent/RecommendationCard";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  await requireParent();
  const supabase = await createClient();

  // RLS (students_parent_read / profiles_parent_read) only returns a row
  // here if this parent is actually linked+approved for this student.
  const { data: childProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", studentId)
    .single();
  const { data: student } = await supabase
    .from("students")
    .select("grade_level, school_track")
    .eq("id", studentId)
    .single();
  if (!childProfile || !student) notFound();

  const grade = await getGrade(supabase, student.grade_level, student.school_track);

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("grade_id", grade?.id ?? "")
    .order("sequence_order");
  const { data: masteryRows } = await supabase
    .from("topic_mastery")
    .select("*")
    .eq("student_id", studentId);
  const masteryByTopic = new Map((masteryRows ?? []).map((m) => [m.topic_id, m]));

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("grade_id", grade?.id ?? "")
    .order("sequence_order");
  const { data: achievedRows } = await supabase
    .from("student_milestones")
    .select("milestone_id")
    .eq("student_id", studentId);
  const achievedIds = new Set((achievedRows ?? []).map((a) => a.milestone_id));

  const { data: recommendations } = await supabase
    .from("parent_recommendations")
    .select("*")
    .eq("student_id", studentId)
    .is("dismissed_at", null)
    .order("generated_at", { ascending: false });

  const masteredCount = (topics ?? []).filter((t) => masteryByTopic.get(t.id)?.status === "mastered").length;
  const overallPercent = topics && topics.length > 0 ? Math.round((masteredCount / topics.length) * 100) : 0;

  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(20);
  const recentChatMessages = (chatMessages ?? []).slice().reverse();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">
        {childProfile.display_name} · {grade?.label ?? `${student.grade_level}. Klasse`}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Gesamtfortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={overallPercent} />
          <p className="text-sm text-muted-foreground">
            {masteredCount} von {topics?.length ?? 0} Themen gemeistert ({overallPercent}%)
          </p>
        </CardContent>
      </Card>

      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((r) => (
              <RecommendationCard key={r.id} id={r.id} message={r.message} severity={r.severity} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Themen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(topics ?? []).map((t) => {
            const mastery = masteryByTopic.get(t.id);
            return (
              <MasteryBar
                key={t.id}
                title={t.title}
                status={mastery?.status ?? "not_started"}
                masteryScore={mastery?.mastery_score ?? 0}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meilensteine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(milestones ?? []).map((m) => (
            <MilestoneBadge key={m.id} title={m.title} achieved={achievedIds.has(m.id)} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chat mit dem Mathe-Tutor (letzte Nachrichten)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentChatMessages.length > 0 ? (
            recentChatMessages.map((m) => (
              <ChatMessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                generatedTitle={m.generated_title}
                generatedSteps={m.generated_steps as { label: string; expression: string }[] | null}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Chat-Nachrichten.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
