"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error: string } | void;

export async function linkChild(formData: FormData): Promise<ActionResult> {
  const code = String(formData.get("inviteCode") ?? "")
    .trim()
    .toUpperCase();
  if (!code) return { error: "Bitte einen Einladungscode eingeben." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };

  const admin = createAdminClient();

  // No RLS policy lets a not-yet-approved parent read an arbitrary student
  // row, by design — this lookup has to go through the service-role client.
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  if (!student) return { error: "Ungültiger Einladungscode." };

  const { error } = await admin.from("parent_child_links").insert({
    parent_id: auth.user.id,
    student_id: student.id,
    status: "approved",
    invite_code: code,
  });
  if (error) {
    if (error.code === "23505") return { error: "Dieses Kind ist bereits mit deinem Konto verknüpft." };
    return { error: error.message };
  }
}

export async function dismissRecommendation(recommendationId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };

  const admin = createAdminClient();

  // Only dismiss a recommendation for a child actually linked to this parent.
  const { data: recommendation } = await admin
    .from("parent_recommendations")
    .select("student_id")
    .eq("id", recommendationId)
    .single();
  if (!recommendation) return { error: "Empfehlung nicht gefunden." };

  const { data: link } = await admin
    .from("parent_child_links")
    .select("id")
    .eq("parent_id", auth.user.id)
    .eq("student_id", recommendation.student_id)
    .eq("status", "approved")
    .maybeSingle();
  if (!link) return { error: "Kein Zugriff." };

  const { error } = await admin
    .from("parent_recommendations")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", recommendationId);
  if (error) return { error: error.message };
}
