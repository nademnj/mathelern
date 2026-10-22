"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAndAwardMilestones } from "@/lib/milestones/checkMilestones";

export async function markLessonStarted(lessonId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      { student_id: auth.user.id, lesson_id: lessonId, status: "in_progress" },
      { onConflict: "student_id,lesson_id", ignoreDuplicates: false }
    );
  if (error) return { error: error.message };
}

export async function markLessonCompleted(lessonId: string, timeSpentMs: number) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      student_id: auth.user.id,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
      time_spent_ms: timeSpentMs,
    },
    { onConflict: "student_id,lesson_id", ignoreDuplicates: false }
  );
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { data: lesson } = await admin.from("lessons").select("topic_id").eq("id", lessonId).single();
  if (lesson) {
    const { data: topic } = await admin.from("topics").select("grade_id").eq("id", lesson.topic_id).single();
    if (topic) await checkAndAwardMilestones(auth.user.id, topic.grade_id);
  }
}
