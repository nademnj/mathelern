import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", topicSlug)
    .eq("is_published", true)
    .single();

  if (!topic) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("topic_id", topic.id)
    .eq("status", "published")
    .order("episode_number");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="secondary">{topic.lehrplan_ref}</Badge>
        <h1 className="mt-2 text-2xl font-semibold">{topic.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lektionen</CardTitle>
        </CardHeader>
        <CardContent>
          {lessons && lessons.length > 0 ? (
            <ul className="space-y-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/lesson/${lesson.slug}`}
                    className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted"
                  >
                    <span>
                      Folge {lesson.episode_number}: {lesson.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~{Math.round((lesson.duration_seconds_estimate ?? 180) / 60)} Min.
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Für dieses Thema ist noch keine Lektion veröffentlicht.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
