import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import type { StoryboardBeat } from "@/lib/content/lessonSchema";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", lessonSlug)
    .eq("status", "published")
    .single();

  if (!lesson) notFound();

  const { data: topic } = await supabase
    .from("topics")
    .select("slug")
    .eq("id", lesson.topic_id)
    .single();
  const topicSlug = topic?.slug ?? "";

  return (
    <LessonPlayer
      lessonId={lesson.id}
      title={lesson.title}
      storyboard={lesson.storyboard_json as StoryboardBeat[]}
      script={lesson.script_json as { beatId: string; narration: string }[]}
      videoUrl={lesson.video_url}
      nextHref={`/topic/${topicSlug}`}
    />
  );
}
