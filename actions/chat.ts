"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askTutor, type ChatTurn, type LessonInfo } from "@/lib/chat/anthropicClient";

const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES_PER_DAY = 100;
const HISTORY_TURNS_FOR_CONTEXT = 20;

const TRACK_LABEL: Record<string, string> = {
  mittelschule_m: "Mittelschule M-Zug",
  fos: "FOS",
  realschule: "Realschule",
};

export interface ChatMessageRow {
  id: string;
  role: "student" | "assistant";
  content: string;
  generatedTitle: string | null;
  generatedSteps: { label: string; expression: string }[] | null;
  createdAt: string;
}

export async function getChatHistory(): Promise<ChatMessageRow[] | { error: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("student_id", auth.user.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return { error: error.message };

  return (data ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    generatedTitle: m.generated_title,
    generatedSteps: m.generated_steps as { label: string; expression: string }[] | null,
    createdAt: m.created_at,
  }));
}

export async function sendChatMessage(
  message: string,
  topicSlug: string | null,
  lessonContext: { lessonId: string; currentStepIndex: number } | null
): Promise<{ assistantMessage: ChatMessageRow } | { error: string }> {
  const trimmed = message.trim();
  if (!trimmed) return { error: "Bitte eine Frage eingeben." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { error: `Bitte kürzer fragen (max. ${MAX_MESSAGE_LENGTH} Zeichen).` };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Nicht angemeldet." };
  const studentId = auth.user.id;

  const admin = createAdminClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("role", "student")
    .gte("created_at", todayStart.toISOString());
  if ((count ?? 0) >= MAX_MESSAGES_PER_DAY) {
    return { error: "Du hast für heute das Chat-Limit erreicht. Versuch's morgen wieder!" };
  }

  const { data: student } = await admin
    .from("students")
    .select("grade_level, school_track")
    .eq("id", studentId)
    .single();
  if (!student) return { error: "Schülerprofil nicht gefunden." };

  let topicTitle: string | null = null;
  if (topicSlug) {
    const { data: topic } = await admin.from("topics").select("title").eq("slug", topicSlug).maybeSingle();
    topicTitle = topic?.title ?? null;
  }

  // Full lesson content + exactly which storyboard step is on screen, so
  // the tutor can explain the actual part the student is looking at
  // instead of just knowing the topic's name.
  let lessonInfo: LessonInfo | null = null;
  if (lessonContext) {
    const { data: lesson } = await admin
      .from("lessons")
      .select("title, topic_id, storyboard_json, script_json")
      .eq("id", lessonContext.lessonId)
      .maybeSingle();
    if (lesson) {
      const storyboard = lesson.storyboard_json as { narrationRef: string }[];
      const script = lesson.script_json as { beatId: string; narration: string }[];
      const scriptByBeatId = new Map(script.map((s) => [s.beatId, s.narration]));
      const orderedNarrations = storyboard.map((beat) => scriptByBeatId.get(beat.narrationRef) ?? "");
      lessonInfo = {
        title: lesson.title,
        orderedNarrations,
        currentStepIndex: Math.min(lessonContext.currentStepIndex, orderedNarrations.length - 1),
      };
      if (!topicTitle) {
        const { data: topic } = await admin.from("topics").select("title").eq("id", lesson.topic_id).maybeSingle();
        topicTitle = topic?.title ?? null;
      }
    }
  }

  const { data: recentRows } = await admin
    .from("chat_messages")
    .select("role, content")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_TURNS_FOR_CONTEXT);
  const history: ChatTurn[] = (recentRows ?? [])
    .reverse()
    .map((r) => ({ role: r.role, content: r.content }));
  history.push({ role: "student", content: trimmed });

  const { error: insertUserError } = await admin.from("chat_messages").insert({
    student_id: studentId,
    role: "student",
    content: trimmed,
    topic_slug: topicSlug,
  });
  if (insertUserError) return { error: insertUserError.message };

  let tutorResponse;
  try {
    tutorResponse = await askTutor(history, {
      gradeLevel: student.grade_level,
      schoolTrackLabel: TRACK_LABEL[student.school_track] ?? student.school_track,
      topicTitle,
      lessonInfo,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Der Tutor ist gerade nicht erreichbar." };
  }

  const { data: inserted, error: insertAssistantError } = await admin
    .from("chat_messages")
    .insert({
      student_id: studentId,
      role: "assistant",
      content: tutorResponse.chatMessage,
      topic_slug: topicSlug,
      generated_title: tutorResponse.visualExplanation?.title ?? null,
      generated_steps: tutorResponse.visualExplanation?.steps ?? null,
    })
    .select("*")
    .single();
  if (insertAssistantError || !inserted) {
    return { error: insertAssistantError?.message ?? "Antwort konnte nicht gespeichert werden." };
  }

  return {
    assistantMessage: {
      id: inserted.id,
      role: "assistant",
      content: inserted.content,
      generatedTitle: inserted.generated_title,
      generatedSteps: inserted.generated_steps as { label: string; expression: string }[] | null,
      createdAt: inserted.created_at,
    },
  };
}
