-- Phase 7: `grades` was keyed by grade NUMBER alone (id smallint, 5-13), so
-- "10th grade" could only ever be one row. Now that we have three tracks,
-- the same grade number exists once per track (e.g. grade 10 for both
-- Gymnasium and Mittelschule). Rekey grades by (grade_number, school_track).
-- Must run after 0005_school_track_enum_values.sql has committed.

-- 1. Move the old table aside.
alter table grades rename to grades_old;

-- 2. New shape: uuid PK, grade_number is the "class" dimension, unique per track.
create table grades (
  id uuid primary key default gen_random_uuid(),
  grade_number smallint not null check (grade_number between 5 and 13),
  label text not null,
  school_track school_track not null default 'gymnasium_g9',
  unique (grade_number, school_track)
);

-- 3. Backfill from the old table (old id was the grade number).
insert into grades (grade_number, label, school_track)
select id, label, school_track from grades_old;

-- 4. Re-point topics.grade_id at the new uuids (join old->new via the pair,
--    not just grade_number, in case grades_old ever held >1 track per number).
alter table topics add column new_grade_id uuid;
update topics t
set new_grade_id = g.id
from grades_old go
join grades g on g.grade_number = go.id and g.school_track = go.school_track
where go.id = t.grade_id;

alter table topics drop column grade_id cascade; -- cascades: drops topics_grade_sequence_idx too
alter table topics rename column new_grade_id to grade_id;
alter table topics alter column grade_id set not null;
alter table topics add constraint topics_grade_id_fkey foreign key (grade_id) references grades (id);
create index topics_grade_sequence_idx on topics (grade_id, sequence_order);

-- 5. Same treatment for milestones.grade_id.
alter table milestones add column new_grade_id uuid;
update milestones m
set new_grade_id = g.id
from grades_old go
join grades g on g.grade_number = go.id and g.school_track = go.school_track
where go.id = m.grade_id;

alter table milestones drop column grade_id cascade;
alter table milestones rename column new_grade_id to grade_id;
alter table milestones alter column grade_id set not null;
alter table milestones add constraint milestones_grade_id_fkey foreign key (grade_id) references grades (id);

-- 6. Sanity checks (run manually, compare before dropping grades_old):
--    select count(*) from grades_old;                      -- should equal count(*) from grades
--    select count(*) from topics where grade_id is null;    -- must be 0
--    select count(*) from milestones where grade_id is null; -- must be 0
drop table grades_old;

-- 7. Seed the two new grade rows for the new programs.
insert into grades (grade_number, label, school_track) values
  (10, '10. Klasse (M-Zug)', 'mittelschule_m'),
  (11, '11. Klasse', 'fos')
on conflict (grade_number, school_track) do nothing;
