-- Restructure to the new 3-track lineup: Mittelschule M10 (unchanged),
-- Realschule 5 (new -- replaces Gymnasium grade 5's pilot), FOS 11
-- (unchanged). Gymnasium is removed entirely: its one other pilot (grade 6
-- "Bruchteile") and its whole unpublished topic list across every grade are
-- deleted, along with the Gymnasium grade rows themselves.
--
-- Must run after 0009_realschule_enum_value.sql has committed.
--
-- Note: Postgres has no `ALTER TYPE ... DROP VALUE` -- the 'gymnasium_g9'
-- literal stays defined on the school_track enum (harmless: nothing
-- references it after this migration, and no application code offers it
-- any more). Removing the literal itself would mean recreating the enum
-- type, which isn't worth the risk for a value nothing points to.

-- 1. Add the Realschule grade 5 row.
insert into grades (grade_number, label, school_track) values
  (5, '5. Klasse', 'realschule')
on conflict (grade_number, school_track) do nothing;

-- 2. Re-point the existing Stellenwertsystem topic from Gymnasium grade 5 to
--    the new Realschule grade 5, and rename its slug/lesson slug away from
--    the bare "m5-" prefix (which was Gymnasium's convention) to "rs5-",
--    matching the ms10-/fos11- track-prefix pattern. The LehrplanPLUS
--    reference "M5 1.1 Natürliche Zahlen im Dezimalsystem" is confirmed
--    accurate for Realschule's own Fachlehrplan too (verified separately,
--    not just carried over from Gymnasium).
update topics
set grade_id = (select id from grades where grade_number = 5 and school_track = 'realschule'),
    slug = 'rs5-stellenwertsystem'
where slug = 'm5-stellenwertsystem';

update lessons set slug = 'rs5-stellenwertsystem-ep1'
where slug = 'm5-stellenwertsystem-ep1';

update milestones
set unlock_rule = jsonb_set(unlock_rule, '{lessonSlug}', '"rs5-stellenwertsystem-ep1"')
where unlock_rule->>'lessonSlug' = 'm5-stellenwertsystem-ep1';

update milestones
set unlock_rule = jsonb_set(unlock_rule, '{topicSlug}', '"rs5-stellenwertsystem"')
where unlock_rule->>'topicSlug' = 'm5-stellenwertsystem';

-- 3. Seed the rest of the Realschule grade 5 topic list, unpublished --
--    same "one pilot published, rest listed for later" pattern as every
--    other track. Carried over from the old Gymnasium grade-5 list (both
--    tracks' early-grade-5 topics largely overlap), but NOT individually
--    spot-checked against the Realschule Fachlehrplan yet -- do that before
--    publishing any of them, same non-blocking caveat as always.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('rs5-ganze-zahlen', 'Ganze Zahlen – negative Zahlen', 'M5 1.2', 2, null, false),
  ('rs5-lagebeziehungen', 'Punkte, Geraden, Strecken, Lagebeziehungen', 'M5 2', 3, null, false),
  ('rs5-koordinatensystem', 'Das Koordinatensystem', 'M5 2', 4, null, false),
  ('rs5-kreise-tangenten', 'Kreise und Tangenten', 'M5 2', 5, null, false),
  ('rs5-grundrechenarten', 'Grundrechenarten & Rechengesetze', 'M5 1.2', 6, null, false),
  ('rs5-schriftlich-multiplizieren-dividieren', 'Schriftliche Multiplikation und Division', 'M5 1.2', 7, null, false),
  ('rs5-umfang-flaeche-rechteck', 'Umfang und Flächeninhalt von Rechteck/Quadrat', 'M5 3', 8, 'geometryAreaGenerator', false),
  ('rs5-quader-wuerfel', 'Quader und Würfel: Oberfläche, Volumen', 'M5 3', 9, null, false),
  ('rs5-achsensymmetrie', 'Achsensymmetrie', 'M5 4', 10, null, false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 5 and g.school_track = 'realschule'
on conflict (slug) do nothing;

-- 4. Remove Gymnasium entirely.
--    a) parent_recommendations.topic_id has no cascade -- clear any rows
--       pointing at a Gymnasium topic before the topics themselves go.
delete from parent_recommendations
where topic_id in (
  select t.id from topics t join grades g on g.id = t.grade_id where g.school_track = 'gymnasium_g9'
);

--    b) milestones.grade_id has no cascade either (student_milestones does
--       cascade from milestones, so deleting these is enough).
delete from milestones
where grade_id in (select id from grades where school_track = 'gymnasium_g9');

--    c) topics cascade to lessons/exercises/exercise_instances/
--       exercise_instance_answers/exercise_attempts/topic_mastery/
--       lesson_progress automatically -- this is everything left under
--       Gymnasium now that the Stellenwertsystem topic has been re-pointed
--       away in step 2 (grade 6 "Bruchteile" plus every unpublished topic
--       across grades 5-13).
delete from topics
where grade_id in (select id from grades where school_track = 'gymnasium_g9');

--    d) now-unreferenced Gymnasium grade rows.
delete from grades where school_track = 'gymnasium_g9';

-- 5. Hygiene: new rows should default to a track that actually has content.
alter table students alter column school_track set default 'realschule';
alter table grades alter column school_track set default 'realschule';

-- 6. Sanity checks (run manually after this commits):
--    select * from topics where slug = 'rs5-stellenwertsystem';          -- 1 row, grade_id -> Realschule 5
--    select count(*) from grades where school_track = 'gymnasium_g9';    -- 0
--    select count(*) from topics t join grades g on g.id = t.grade_id
--      where g.school_track = 'gymnasium_g9';                           -- 0
