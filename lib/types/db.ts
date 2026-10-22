// Hand-written mirror of supabase/migrations/0001_init_schema.sql.
// Once a real Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > lib/types/db.ts
// and re-apply any manual additions here.

export type UserRole = "student" | "parent";
export type SchoolTrack = "gymnasium_g9";
export type ParentLinkStatus = "pending" | "approved" | "revoked";
export type LessonStatus = "draft" | "review" | "published";
export type ExerciseMode = "static" | "generated";
export type TopicMasteryStatus = "not_started" | "in_progress" | "struggling" | "mastered";
export type LessonProgressStatus = "not_started" | "in_progress" | "completed";
export type RecommendationSeverity = "info" | "suggested" | "priority";

interface Table<Row, Insert extends Partial<Row> = Partial<Row>, Update extends Partial<Row> = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      profiles: Table<{
        id: string;
        role: UserRole;
        display_name: string;
        created_at: string;
      }>;
      students: Table<{
        id: string;
        grade_level: number;
        school_track: SchoolTrack;
      }>;
      parents: Table<{ id: string }>;
      parent_child_links: Table<{
        id: string;
        parent_id: string;
        student_id: string;
        status: ParentLinkStatus;
        invite_code: string | null;
        created_at: string;
      }>;
      grades: Table<{
        id: number;
        label: string;
        school_track: SchoolTrack;
      }>;
      topics: Table<{
        id: string;
        grade_id: number;
        parent_topic_id: string | null;
        slug: string;
        title: string;
        lehrplan_ref: string | null;
        lehrplan_hours: number | null;
        sequence_order: number;
        generator_key: string | null;
        is_published: boolean;
      }>;
      lessons: Table<{
        id: string;
        topic_id: string;
        slug: string;
        title: string;
        episode_number: number;
        script_md: string;
        script_json: unknown;
        storyboard_json: unknown;
        video_url: string | null;
        duration_seconds_estimate: number | null;
        status: LessonStatus;
        content_version: number;
      }>;
      exercises: Table<{
        id: string;
        topic_id: string;
        mode: ExerciseMode;
        difficulty_tier: number;
        generator_key: string | null;
        generator_params: unknown;
        static_payload: unknown;
        solution_script: unknown;
        tags: string[];
      }>;
      exercise_instances: Table<{
        id: string;
        exercise_id: string;
        student_id: string;
        seed: number;
        rendered_question: unknown;
        created_at: string;
      }>;
      // RLS-locked: no policies defined, only the service-role client can
      // touch this table. See migrations/0003_exercise_answer_secrecy.sql.
      exercise_instance_answers: Table<{
        exercise_instance_id: string;
        rendered_answer: unknown;
        solution_steps: unknown;
      }>;
      exercise_attempts: Table<{
        id: string;
        exercise_instance_id: string;
        student_id: string;
        submitted_answer: unknown;
        is_correct: boolean;
        time_spent_ms: number | null;
        hint_used: boolean;
        attempt_number: number;
        created_at: string;
      }>;
      topic_mastery: Table<{
        id: string;
        student_id: string;
        topic_id: string;
        mastery_score: number;
        consecutive_correct: number;
        consecutive_incorrect: number;
        last_difficulty_tier: number;
        status: TopicMasteryStatus;
        updated_at: string;
      }>;
      lesson_progress: Table<{
        id: string;
        student_id: string;
        lesson_id: string;
        status: LessonProgressStatus;
        completed_at: string | null;
        time_spent_ms: number | null;
      }>;
      milestones: Table<{
        id: string;
        grade_id: number;
        topic_id: string | null;
        title: string;
        icon_key: string;
        sequence_order: number;
        unlock_rule: unknown;
      }>;
      student_milestones: Table<{
        id: string;
        student_id: string;
        milestone_id: string;
        achieved_at: string;
      }>;
      parent_recommendations: Table<{
        id: string;
        student_id: string;
        topic_id: string | null;
        severity: RecommendationSeverity;
        message: string;
        suggested_action: unknown;
        generated_at: string;
        dismissed_at: string | null;
        generated_by: string;
      }>;
    };
  };
}
