-- The grade-5 Realschule topic list was built from the abstract LehrplanPLUS
-- Lernbereich grouping. The student's actual textbook has its own 9-chapter
-- table of contents, and it doesn't match 1:1:
--   1 Daten auswerten          4 Größen                  7 Ganze Zahlen
--   2 Natürliche Zahlen        5 Geometrische Grundformen 8 Teilbarkeit
--   3 Rechnen mit nat. Zahlen  6 Ebene/räumliche Figuren  9 Umfang/Fläche
--
-- "Kombinatorik" isn't one of the book's 9 chapters -- same kind of mistake
-- as the 6 placeholders migration 0011 removed, so it's dropped the same
-- way. "Geometrische Grundformen" and "Ebene und räumliche Figuren" were
-- both filed under one lehrplan_ref ("M5 3") before; they're the book's
-- chapters 5 and 6 respectively, now split and retitled in supabase/seed.sql
-- (which also carries the corrected titles/order/lehrplan_ref for every
-- other grade-5 topic -- run that AFTER this commits).
--
-- Nothing here has a lesson a real student has progress on yet (this is
-- still pre-launch content), so this is a plain cleanup delete, not a data
-- migration.

-- parent_recommendations.topic_id does not cascade from topics -- delete
-- first, same as migration 0011 and the earlier Gymnasium cleanup.
delete from parent_recommendations
where topic_id in (select id from topics where slug = 'rs5-kombinatorik');

-- milestones.topic_id does not cascade either, but these milestones key off
-- unlock_rule's topicSlug/lessonSlug (jsonb), not a topic_id FK -- delete by
-- the exact titles seed.sql used to insert them, since those titles are
-- changing (so seed.sql's own NOT EXISTS guard won't catch and replace the
-- stale rows on its own).
delete from milestones
where grade_id in (select id from grades where grade_number = 5 and school_track = 'realschule')
  and title in ('Erste Lektion: Stellenwertsystem', 'Kombinatorik gemeistert');

delete from topics where slug = 'rs5-kombinatorik';
