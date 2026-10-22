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
    .select("title, generator_key")
    .eq("slug", topicSlug)
    .eq("is_published", true)
    .single();

  if (!topic || !topic.generator_key) notFound();

  return (
    <ExerciseRunner topicSlug={topicSlug} topicTitle={topic.title} topicHref={`/topic/${topicSlug}`} />
  );
}
