-- Phase 5: parent-child linking by invite code, and a gap fix — parents
-- could already read a linked student's rows in students/topic_mastery/
-- lesson_progress/parent_recommendations (see 0001), but profiles had no
-- parent-read policy, so a parent couldn't even see the child's display
-- name. Add that policy here.

alter table students add column invite_code text unique;

create policy profiles_parent_read on profiles for select
  using (is_approved_parent_of(id));
