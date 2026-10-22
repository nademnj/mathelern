-- Seed data: grades 5-13 (Gymnasium G9) + grade 5/6 pilot topics.
-- Topics are marked is_published = true so they're visible to students immediately;
-- flip to false for any topic whose content isn't ready yet.

insert into grades (id, label, school_track) values
  (5, '5. Klasse', 'gymnasium_g9'),
  (6, '6. Klasse', 'gymnasium_g9'),
  (7, '7. Klasse', 'gymnasium_g9'),
  (8, '8. Klasse', 'gymnasium_g9'),
  (9, '9. Klasse', 'gymnasium_g9'),
  (10, '10. Klasse', 'gymnasium_g9'),
  (11, '11. Klasse', 'gymnasium_g9'),
  (12, '12. Klasse', 'gymnasium_g9'),
  (13, '13. Klasse', 'gymnasium_g9')
on conflict (id) do nothing;

-- Grade 5
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published) values
  (5, 'm5-stellenwertsystem', 'Das Stellenwertsystem & natürliche Zahlen', 'M5 1.1', 1, 'placeValueGenerator', true),
  (5, 'm5-ganze-zahlen', 'Ganze Zahlen – negative Zahlen', 'M5 1.1', 2, null, false),
  (5, 'm5-lagebeziehungen', 'Punkte, Geraden, Strecken, Lagebeziehungen', 'M5 2', 3, null, false),
  (5, 'm5-koordinatensystem', 'Das Koordinatensystem', 'M5 2', 4, null, false),
  (5, 'm5-kreise-tangenten', 'Kreise und Tangenten', 'M5 2', 5, null, false),
  (5, 'm5-grundrechenarten', 'Grundrechenarten & Rechengesetze', 'M5 3', 6, null, false),
  (5, 'm5-schriftlich-multiplizieren-dividieren', 'Schriftliche Multiplikation und Division', 'M5 3', 7, null, false),
  (5, 'm5-umfang-flaeche-rechteck', 'Umfang und Flächeninhalt von Rechteck/Quadrat', 'M5 4', 8, 'geometryAreaGenerator', false),
  (5, 'm5-quader-wuerfel', 'Quader und Würfel: Oberfläche, Volumen', 'M5 4', 9, null, false),
  (5, 'm5-achsensymmetrie', 'Achsensymmetrie', 'M5 5', 10, null, false)
on conflict (slug) do nothing;

-- Grade 6
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published) values
  (6, 'm6-bruchteile', 'Bruchteile verstehen', 'M6 1.1', 1, 'fractionsGenerator', true),
  (6, 'm6-erweitern-kuerzen', 'Erweitern und Kürzen von Brüchen', 'M6 1.1', 2, 'fractionsGenerator', false),
  (6, 'm6-vergleichen-ordnen', 'Brüche vergleichen und ordnen', 'M6 1.1', 3, 'fractionsGenerator', false),
  (6, 'm6-multiplizieren', 'Multiplizieren von Brüchen', 'M6 1.2', 4, 'fractionsGenerator', false),
  (6, 'm6-dividieren', 'Dividieren von Brüchen', 'M6 1.2', 5, 'fractionsGenerator', false),
  (6, 'm6-addieren-subtrahieren', 'Addieren/Subtrahieren von Brüchen', 'M6 1.3', 6, 'fractionsGenerator', false),
  (6, 'm6-rationale-zahlen', 'Rationale Zahlen: negative Brüche', 'M6 1.3', 7, 'fractionsGenerator', false),
  (6, 'm6-dezimalbrueche-stellenwerte', 'Dezimalbrüche: Stellenwerte, Runden', 'M6 2', 8, 'decimalsGenerator', false),
  (6, 'm6-dezimalbrueche-rechnen', 'Rechnen mit Dezimalbrüchen', 'M6 2', 9, 'decimalsGenerator', false),
  (6, 'm6-umwandlung', 'Umwandlung Brüche ↔ Dezimalbrüche', 'M6 2', 10, 'decimalsGenerator', false),
  (6, 'm6-winkel', 'Winkel: Messen, Benennen, Arten', 'M6 3', 11, null, false),
  (6, 'm6-flaeche-dreieck-parallelogramm', 'Flächeninhalt von Dreieck und Parallelogramm', 'M6 3', 12, 'geometryAreaGenerator', false)
on conflict (slug) do nothing;

-- Exercise catalog: one "generated" exercise definition per (topic, tier 1-5)
-- for the two pilot topics that have a published lesson. Each row is just a
-- pointer at a generator + tier; the actual question is rendered per-student
-- at runtime by lib/generators/*.ts (see actions/exercises.ts).
insert into exercises (topic_id, mode, difficulty_tier, generator_key, generator_params, solution_script)
select t.id, 'generated', tier, t.generator_key, '{}'::jsonb, '[]'::jsonb
from topics t
cross join generate_series(1, 5) as tier
where t.slug in ('m5-stellenwertsystem', 'm6-bruchteile')
  and not exists (
    select 1 from exercises e where e.topic_id = t.id and e.difficulty_tier = tier
  );

-- Milestones (see lib/milestones/checkMilestones.ts for the unlock_rule shapes
-- it understands: lesson_completed by lessonSlug, topic_mastered by topicSlug).
-- No natural unique key on this table, so guard re-running seed.sql with NOT EXISTS.
insert into milestones (grade_id, title, icon_key, sequence_order, unlock_rule)
select * from (values
  (5::smallint, 'Erste Lektion: Stellenwertsystem', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "m5-stellenwertsystem-ep1"}'::jsonb),
  (5::smallint, 'Stellenwertsystem gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "m5-stellenwertsystem"}'::jsonb),
  (6::smallint, 'Erste Lektion: Bruchteile', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "m6-bruchteile-ep1"}'::jsonb),
  (6::smallint, 'Brüche gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "m6-bruchteile"}'::jsonb)
) as new_milestones(grade_id, title, icon_key, sequence_order, unlock_rule)
where not exists (
  select 1 from milestones m where m.grade_id = new_milestones.grade_id and m.title = new_milestones.title
);
