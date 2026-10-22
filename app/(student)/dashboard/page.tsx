import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/roles";
import { getGrade } from "@/lib/curriculum/getGrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentDashboardPage() {
  const { profile, student } = await requireStudent();
  const supabase = await createClient();

  const grade = await getGrade(supabase, student?.grade_level ?? 5, student?.school_track ?? "gymnasium_g9");

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("grade_id", grade?.id ?? "")
    .order("sequence_order");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">
        Willkommen, {profile.display_name}!
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{grade?.label ?? `${student?.grade_level}. Klasse`} – Themen</CardTitle>
        </CardHeader>
        <CardContent>
          {topics && topics.length > 0 ? (
            <ul className="space-y-2">
              {topics.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/topic/${t.slug}`}
                    className="block rounded-md border px-4 py-3 hover:bg-muted"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
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
