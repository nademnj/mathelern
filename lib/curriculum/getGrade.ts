import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SchoolTrack } from "@/lib/types/db";

export interface GradeRow {
  id: string;
  grade_number: number;
  school_track: SchoolTrack;
  label: string;
}

/**
 * Resolves a grade's uuid for a (grade_number, school_track) pair — grades
 * are keyed by that pair, not grade_number alone, since the same grade
 * number exists once per school track (see migrations 0005/0006).
 */
export async function getGrade(
  supabase: SupabaseClient<Database>,
  gradeNumber: number,
  schoolTrack: SchoolTrack
): Promise<GradeRow | null> {
  const { data } = await supabase
    .from("grades")
    .select("*")
    .eq("grade_number", gradeNumber)
    .eq("school_track", schoolTrack)
    .maybeSingle();
  return data ?? null;
}
