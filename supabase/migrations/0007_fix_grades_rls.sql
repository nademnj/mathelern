-- Bug fix: 0006_multi_track_grades.sql recreated `grades` from scratch
-- (rename-old / create-new, to rekey it by (grade_number, school_track)).
-- Every other altered table in that migration only had a column changed,
-- so its RLS state and policies survived untouched -- but a freshly
-- CREATE TABLE'd `grades` has RLS off and zero policies, so PostgREST
-- silently returned 0 rows to anon/authenticated (no error, just empty),
-- breaking every page that resolves a grade (dashboard, progress, parent
-- pages, registration). Restore the same public-read policy `grades` had
-- before 0006 ran.

alter table grades enable row level security;
create policy grades_read_all on grades for select using (true);
