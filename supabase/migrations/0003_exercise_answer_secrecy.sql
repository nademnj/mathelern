-- exercise_instances.rendered_answer was reachable by the owning student's
-- own RLS policy (exercise_instances_student_all, needed so a student can
-- list/audit their own past instances). That's fine for the question, but
-- it would let a student read the correct answer directly via the Supabase
-- client before submitting, defeating "answer-checking stays server-side"
-- (see plan's tech stack section). Move the answer into its own table with
-- RLS enabled and *no* policies at all, so only the service-role client
-- (used exclusively by actions/exercises.ts, server-only) can ever read or
-- write it — the default-deny behavior of RLS with zero policies.

alter table exercise_instances drop column rendered_answer;

create table exercise_instance_answers (
  exercise_instance_id uuid primary key references exercise_instances (id) on delete cascade,
  rendered_answer jsonb not null,
  -- The generator produces a fresh worked solution per instance (numbers
  -- differ each time); persist it here rather than on `exercises`, for the
  -- same reason as rendered_answer — it must stay out of student reach
  -- until after they submit.
  solution_steps jsonb not null default '[]'::jsonb
);

alter table exercise_instance_answers enable row level security;
-- Intentionally no policies: anon/authenticated get zero access; only the
-- service-role key (which bypasses RLS) can read or write this table.
