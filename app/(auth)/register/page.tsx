import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterStudentForm } from "@/components/auth/RegisterStudentForm";
import type { SchoolTrack } from "@/lib/types/db";

export default async function RegisterStudentPage() {
  const supabase = await createClient();
  const { data: grades } = await supabase
    .from("grades")
    .select("*")
    .order("school_track")
    .order("grade_number");

  const gradesByTrack: Record<string, { gradeNumber: number; label: string }[]> = {};
  for (const g of grades ?? []) {
    (gradesByTrack[g.school_track] ??= []).push({ gradeNumber: g.grade_number, label: g.label });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Schülerkonto erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterStudentForm gradesByTrack={gradesByTrack as Record<SchoolTrack, { gradeNumber: number; label: string }[]>} />
          <p className="text-center text-sm text-muted-foreground">
            Bereits ein Konto? <Link href="/login" className="underline">Anmelden</Link>
            <br />
            Du bist ein Elternteil?{" "}
            <Link href="/register/parent" className="underline">
              Hier registrieren
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
