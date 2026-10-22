"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/auth/inviteCode";

type ActionResult = { error: string } | void;

// Pilot shortcut: we auto-confirm email via the admin client and create the
// profile/role row server-side in one step, instead of waiting on an email
// confirmation round-trip. Revisit before any real (non-pilot) launch.
export async function registerStudent(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const gradeLevel = Number(formData.get("gradeLevel"));

  if (!email || !password || !displayName) return { error: "Bitte alle Felder ausfüllen." };
  if (!Number.isInteger(gradeLevel) || gradeLevel < 5 || gradeLevel > 13) {
    return { error: "Bitte eine Klasse zwischen 5 und 13 wählen." };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created?.user) {
    return { error: createError?.message ?? "Registrierung fehlgeschlagen." };
  }
  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: userId, role: "student", display_name: displayName });
  if (profileError) return { error: profileError.message };

  // Retry a few times on the rare invite_code collision (unique constraint).
  let studentError: { message: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await admin.from("students").insert({
      id: userId,
      grade_level: gradeLevel,
      school_track: "gymnasium_g9",
      invite_code: generateInviteCode(),
    });
    studentError = error;
    if (!error || error.code !== "23505") break;
  }
  if (studentError) return { error: studentError.message };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  redirect("/dashboard");
}

export async function registerParent(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !displayName) return { error: "Bitte alle Felder ausfüllen." };

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created?.user) {
    return { error: createError?.message ?? "Registrierung fehlgeschlagen." };
  }
  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: userId, role: "parent", display_name: displayName });
  if (profileError) return { error: profileError.message };

  const { error: parentError } = await admin.from("parents").insert({ id: userId });
  if (parentError) return { error: parentError.message };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  redirect("/parent/dashboard");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Bitte E-Mail und Passwort eingeben." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: error?.message ?? "Anmeldung fehlgeschlagen." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.role === "parent" ? "/parent/dashboard" : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
