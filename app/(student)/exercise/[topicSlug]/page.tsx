import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExerciseRunner } from "@/components/exercise/ExerciseRunner";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, generator_key")
    .eq("slug", topicSlug)
    .eq("is_published", true)
    .single();

  if (!topic || !topic.generator_key) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("slug, title, script_json")
    .eq("topic_id", topic.id)
    .eq("status", "published")
    .order("episode_number")
    .limit(1)
    .maybeSingle();

  // Skip the intro beats (history/why/real-world) for the sidebar recap --
  // those motivate the lesson, the exercise sidebar should recap the actual
  // content a student might want to re-check mid-exercise.
  const summaryBullets = lesson
    ? ((lesson.script_json as { beatId: string; narration: string }[]) ?? [])
        .filter((s) => !s.beatId.startsWith("intro_"))
        .slice(0, 6)
        .map((s) => s.narration)
    : [];

  return (
    <ExerciseRunner
      topicSlug={topicSlug}
      topicTitle={topic.title}
      topicHref={`/topic/${topicSlug}`}
      lessonHref={lesson ? `/lesson/${lesson.slug}` : null}
      lessonSummary={lesson ? { title: lesson.title, bullets: summaryBullets } : null}
    />
  );
}
