-- AI chat tutor: one row per message, student and assistant turns
-- interleaved. generated_steps holds the step-reveal content when the
-- assistant judges a fresh visual explanation will help (rendered with the
-- existing EquationStepReveal component, not a stored lesson).

create type chat_role as enum ('student', 'assistant');

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  role chat_role not null,
  content text not null,
  topic_slug text,
  generated_title text,
  generated_steps jsonb,
  created_at timestamptz not null default now()
);

create index chat_messages_student_created_idx on chat_messages (student_id, created_at);

alter table chat_messages enable row level security;

-- Student: full access to their own messages (insert via server action,
-- which uses the service-role client — this policy mainly covers reads from
-- the normal client when loading history, plus defense in depth).
create policy chat_messages_student_all on chat_messages for all
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- Parent: read-only, same pattern as every other student-owned table.
create policy chat_messages_parent_read on chat_messages for select
  using (is_approved_parent_of(student_id));
