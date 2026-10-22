import { createAdminClient } from "@/lib/supabase/admin";

type LessonCompletedRule = { type: "lesson_completed"; lessonSlug: string };
type TopicMasteredRule = { type: "topic_mastered"; topicSlug: string };
type UnlockRule = LessonCompletedRule | TopicMasteredRule;

async function isUnlocked(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  rule: UnlockRule
): Promise<boolean> {
  if (rule.type === "lesson_completed") {
    const { data: lesson } = await admin.from("lessons").select("id").eq("slug", rule.lessonSlug).maybeSingle();
    if (!lesson) return false;
    const { data: progress } = await admin
      .from("lesson_progress")
      .select("status")
      .eq("student_id", studentId)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    return progress?.status === "completed";
  }

  if (rule.type === "topic_mastered") {
    const { data: topic } = await admin.from("topics").select("id").eq("slug", rule.topicSlug).maybeSingle();
    if (!topic) return false;
    const { data: mastery } = await admin
      .from("topic_mastery")
      .select("status")
      .eq("student_id", studentId)
      .eq("topic_id", topic.id)
      .maybeSingle();
    return mastery?.status === "mastered";
  }

  return false;
}

/**
 * Evaluates every not-yet-achieved milestone for a grade and awards any
 * that now qualify. Called after a lesson completes and after an exercise
 * attempt updates topic_mastery — cheap at this scale (a handful of
 * milestones per grade), no need for DB triggers.
 */
export async function checkAndAwardMilestones(studentId: string, gradeId: number) {
  const admin = createAdminClient();

  const { data: milestones } = await admin.from("milestones").select("*").eq("grade_id", gradeId);
  if (!milestones || milestones.length === 0) return;

  const { data: achieved } = await admin
    .from("student_milestones")
    .select("milestone_id")
    .eq("student_id", studentId);
  const achievedIds = new Set((achieved ?? []).map((a) => a.milestone_id));

  for (const milestone of milestones) {
    if (achievedIds.has(milestone.id)) continue;
    const rule = milestone.unlock_rule as UnlockRule;
    if (await isUnlocked(admin, studentId, rule)) {
      await admin.from("student_milestones").insert({ student_id: studentId, milestone_id: milestone.id });
    }
  }
}
