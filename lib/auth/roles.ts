import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/getSession";

/** Use in (student) layout. Redirects non-students away. */
export async function requireStudent() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect("/parent/dashboard");

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", profile.id)
    .single();

  return { profile, student };
}

/** Use in (parent) layout. Redirects non-parents away. */
export async function requireParent() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent") redirect("/dashboard");
  return { profile };
}
