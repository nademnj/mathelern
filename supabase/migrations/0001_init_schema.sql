-- Bavarian Math Learning App — initial schema (Phase 1)
-- Roles, grades/topics/lessons, exercises, mastery/progress, milestones, parent recommendations.

create extension if not exists "pgcrypto";

-- ===================== Enums =====================
create type user_role as enum ('student', 'parent');
create type school_track as enum ('gymnasium_g9');
create type parent_link_status as enum ('pending', 'approved', 'revoked');
create type lesson_status as enum ('draft', 'review', 'published');
create type exercise_mode as enum ('static', 'generated');
create type topic_mastery_status as enum ('not_started', 'in_progress', 'struggling', 'mastered');
create type lesson_progress_status as enum ('not_started', 'in_progress', 'completed');
create type recommendation_severity as enum ('info', 'suggested', 'priority');

-- ===================== Core identity =====================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key references profiles (id) on delete cascade,
  grade_level smallint not null check (grade_level between 5 and 13),
  school_track school_track not null default 'gymnasium_g9'
);

create table parents (
  id uuid primary key references profiles (id) on delete cascade
);

create table parent_child_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  status parent_link_status not null default 'pending',
  invite_code text,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

-- ===================== Curriculum =====================
create table grades (
  id smallint primary key check (id between 5 and 13),
  label text not null,
  school_track school_track not null default 'gymnasium_g9'
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  grade_id smallint not null references grades (id),
  parent_topic_id uuid references topics (id),
  slug text not null unique,
  title text not null,
  lehrplan_ref text,
  lehrplan_hours numeric,
  sequence_order int not null,
  generator_key text,
  is_published boolean not null default false
);
create index topics_grade_sequence_idx on topics (grade_id, sequence_order);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete cascade,
  slug text not null unique,
  title text not null,
  episode_number int not null default 1,
  script_md text not null default '',
  storyboard_json jsonb not null default '[]'::jsonb,
  video_url text,
  duration_seconds_estimate int,
  status lesson_status not null default 'draft',
  content_version int not null default 1
);
create index lessons_topic_idx on lessons (topic_id);

-- ===================== Exercises =====================
create table exercises (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete cascade,
  mode exercise_mode not null,
  difficulty_tier smallint not null check (difficulty_tier between 1 and 5),
  generator_key text,
  generator_params jsonb,
  static_payload jsonb,
  solution_script jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}'
);
create index exercises_topic_tier_idx on exercises (topic_id, difficulty_tier);

create table exercise_instances (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  seed bigint not null,
  rendered_question jsonb not null,
  rendered_answer jsonb not null,
  created_at timestamptz not null default now()
);
create index exercise_instances_student_idx on exercise_instances (student_id, created_at);

create table exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_instance_id uuid not null references exercise_instances (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  submitted_answer jsonb not null,
  is_correct boolean not null,
  time_spent_ms int,
  hint_used boolean not null default false,
  attempt_number smallint not null default 1,
  created_at timestamptz not null default now()
);
create index exercise_attempts_student_idx on exercise_attempts (student_id, created_at);

-- ===================== Progress =====================
create table topic_mastery (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  mastery_score numeric not null default 0,
  consecutive_correct smallint not null default 0,
  consecutive_incorrect smallint not null default 0,
  last_difficulty_tier smallint not null default 1,
  status topic_mastery_status not null default 'not_started',
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);
create index topic_mastery_student_topic_idx on topic_mastery (student_id, topic_id);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  status lesson_progress_status not null default 'not_started',
  completed_at timestamptz,
  time_spent_ms int,
  unique (student_id, lesson_id)
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  grade_id smallint not null references grades (id),
  topic_id uuid references topics (id),
  title text not null,
  icon_key text not null default 'star',
  sequence_order int not null,
  unlock_rule jsonb not null default '{}'::jsonb
);

create table student_milestones (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  milestone_id uuid not null references milestones (id) on delete cascade,
  achieved_at timestamptz not null default now(),
  unique (student_id, milestone_id)
);

create table parent_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  topic_id uuid references topics (id),
  severity recommendation_severity not null default 'info',
  message text not null,
  suggested_action jsonb,
  generated_at timestamptz not null default now(),
  dismissed_at timestamptz,
  generated_by text not null default 'rule_engine_v1'
);
create index parent_recommendations_student_idx on parent_recommendations (student_id, generated_at);

-- ===================== Row Level Security =====================
alter table profiles enable row level security;
alter table students enable row level security;
alter table parents enable row level security;
alter table parent_child_links enable row level security;
alter table grades enable row level security;
alter table topics enable row level security;
alter table lessons enable row level security;
alter table exercises enable row level security;
alter table exercise_instances enable row level security;
alter table exercise_attempts enable row level security;
alter table topic_mastery enable row level security;
alter table lesson_progress enable row level security;
alter table milestones enable row level security;
alter table student_milestones enable row level security;
alter table parent_recommendations enable row level security;

-- Curriculum tables are public-readable (no PII) once published.
create policy grades_read_all on grades for select using (true);
create policy topics_read_published on topics for select using (is_published = true);
create policy lessons_read_published on lessons for select using (
  exists (select 1 from topics t where t.id = lessons.topic_id and t.is_published = true)
);
create policy exercises_read_all on exercises for select using (
  exists (select 1 from topics t where t.id = exercises.topic_id and t.is_published = true)
);
create policy milestones_read_all on milestones for select using (true);

-- profiles: a user can read/update only their own profile row.
create policy profiles_self_select on profiles for select using (auth.uid() = id);
create policy profiles_self_update on profiles for update using (auth.uid() = id);
create policy profiles_self_insert on profiles for insert with check (auth.uid() = id);

-- helper: is this uid an approved parent of this student?
create or replace function is_approved_parent_of(p_student_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from parent_child_links
    where student_id = p_student_id
      and parent_id = auth.uid()
      and status = 'approved'
  );
$$;

-- students: student sees/edits only self; approved parent can SELECT only.
create policy students_self_all on students for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy students_parent_read on students for select
  using (is_approved_parent_of(id));

create policy parents_self_all on parents for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy parent_child_links_parent_rw on parent_child_links for all
  using (auth.uid() = parent_id) with check (auth.uid() = parent_id);
create policy parent_child_links_student_read on parent_child_links for select
  using (auth.uid() = student_id);

-- student-owned progress/exercise tables: student full access to own rows,
-- approved parent gets SELECT only. No parent write policy exists anywhere below.
create policy exercise_instances_student_all on exercise_instances for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy exercise_instances_parent_read on exercise_instances for select
  using (is_approved_parent_of(student_id));

create policy exercise_attempts_student_all on exercise_attempts for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy exercise_attempts_parent_read on exercise_attempts for select
  using (is_approved_parent_of(student_id));

create policy topic_mastery_student_all on topic_mastery for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy topic_mastery_parent_read on topic_mastery for select
  using (is_approved_parent_of(student_id));

create policy lesson_progress_student_all on lesson_progress for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy lesson_progress_parent_read on lesson_progress for select
  using (is_approved_parent_of(student_id));

create policy student_milestones_student_all on student_milestones for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy student_milestones_parent_read on student_milestones for select
  using (is_approved_parent_of(student_id));

-- parent_recommendations: generated by server (service role) only; student and
-- approved parent can read; nobody gets client-side insert/update/delete.
create policy parent_recommendations_student_read on parent_recommendations for select
  using (auth.uid() = student_id);
create policy parent_recommendations_parent_read on parent_recommendations for select
  using (is_approved_parent_of(student_id));
