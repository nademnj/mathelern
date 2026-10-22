-- Seed data: grades 5-13 (Gymnasium G9) + grade 10 (Mittelschule M-Zug) +
-- grade 11 (FOS), and their pilot topics. Topics are marked is_published =
-- true so they're visible to students immediately; flip to false for any
-- topic whose content isn't ready yet.
--
-- grades is keyed by (grade_number, school_track) — see migrations
-- 0005/0006 — so every topics/milestones insert below resolves grade_id via
-- a join rather than a literal integer.

insert into grades (grade_number, label, school_track) values
  (5, '5. Klasse', 'gymnasium_g9'),
  (6, '6. Klasse', 'gymnasium_g9'),
  (7, '7. Klasse', 'gymnasium_g9'),
  (8, '8. Klasse', 'gymnasium_g9'),
  (9, '9. Klasse', 'gymnasium_g9'),
  (10, '10. Klasse', 'gymnasium_g9'),
  (11, '11. Klasse', 'gymnasium_g9'),
  (12, '12. Klasse', 'gymnasium_g9'),
  (13, '13. Klasse', 'gymnasium_g9'),
  (10, '10. Klasse (M-Zug)', 'mittelschule_m'),
  (11, '11. Klasse', 'fos')
on conflict (grade_number, school_track) do nothing;

-- Grade 5 (Gymnasium)
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('m5-stellenwertsystem', 'Das Stellenwertsystem & natürliche Zahlen', 'M5 1.1', 1, 'placeValueGenerator', true),
  ('m5-ganze-zahlen', 'Ganze Zahlen – negative Zahlen', 'M5 1.1', 2, null, false),
  ('m5-lagebeziehungen', 'Punkte, Geraden, Strecken, Lagebeziehungen', 'M5 2', 3, null, false),
  ('m5-koordinatensystem', 'Das Koordinatensystem', 'M5 2', 4, null, false),
  ('m5-kreise-tangenten', 'Kreise und Tangenten', 'M5 2', 5, null, false),
  ('m5-grundrechenarten', 'Grundrechenarten & Rechengesetze', 'M5 3', 6, null, false),
  ('m5-schriftlich-multiplizieren-dividieren', 'Schriftliche Multiplikation und Division', 'M5 3', 7, null, false),
  ('m5-umfang-flaeche-rechteck', 'Umfang und Flächeninhalt von Rechteck/Quadrat', 'M5 4', 8, 'geometryAreaGenerator', false),
  ('m5-quader-wuerfel', 'Quader und Würfel: Oberfläche, Volumen', 'M5 4', 9, null, false),
  ('m5-achsensymmetrie', 'Achsensymmetrie', 'M5 5', 10, null, false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 5 and g.school_track = 'gymnasium_g9'
on conflict (slug) do nothing;

-- Grade 6 (Gymnasium)
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('m6-bruchteile', 'Bruchteile verstehen', 'M6 1.1', 1, 'fractionsGenerator', true),
  ('m6-erweitern-kuerzen', 'Erweitern und Kürzen von Brüchen', 'M6 1.1', 2, 'fractionsGenerator', false),
  ('m6-vergleichen-ordnen', 'Brüche vergleichen und ordnen', 'M6 1.1', 3, 'fractionsGenerator', false),
  ('m6-multiplizieren', 'Multiplizieren von Brüchen', 'M6 1.2', 4, 'fractionsGenerator', false),
  ('m6-dividieren', 'Dividieren von Brüchen', 'M6 1.2', 5, 'fractionsGenerator', false),
  ('m6-addieren-subtrahieren', 'Addieren/Subtrahieren von Brüchen', 'M6 1.3', 6, 'fractionsGenerator', false),
  ('m6-rationale-zahlen', 'Rationale Zahlen: negative Brüche', 'M6 1.3', 7, 'fractionsGenerator', false),
  ('m6-dezimalbrueche-stellenwerte', 'Dezimalbrüche: Stellenwerte, Runden', 'M6 2', 8, 'decimalsGenerator', false),
  ('m6-dezimalbrueche-rechnen', 'Rechnen mit Dezimalbrüchen', 'M6 2', 9, 'decimalsGenerator', false),
  ('m6-umwandlung', 'Umwandlung Brüche ↔ Dezimalbrüche', 'M6 2', 10, 'decimalsGenerator', false),
  ('m6-winkel', 'Winkel: Messen, Benennen, Arten', 'M6 3', 11, null, false),
  ('m6-flaeche-dreieck-parallelogramm', 'Flächeninhalt von Dreieck und Parallelogramm', 'M6 3', 12, 'geometryAreaGenerator', false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 6 and g.school_track = 'gymnasium_g9'
on conflict (slug) do nothing;

-- Grade 10 Mittelschule M-Zug (M10) — LehrplanPLUS, confirmed current
-- ("gültig ab Schuljahr 2022/23"). Pilot: ms10-potenzgesetze.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('ms10-potenzgesetze', 'Potenzschreibweise & Potenzgesetze', 'M10 LB1', 1, 'powersRootsGenerator', true),
  ('ms10-wurzeln-wurzelgesetze', 'n-te Wurzel & Wurzelgesetze', 'M10 LB1', 2, 'powersRootsGenerator', false),
  ('ms10-logarithmus-einfuehrung', 'Logarithmus zur Exponentenermittlung', 'M10 LB1', 3, null, false),
  ('ms10-exponentielles-wachstum', 'Exponentielles Wachstum & Abnahme', 'M10 LB2', 4, null, false),
  ('ms10-aehnlichkeit-zentrische-streckung', 'Ähnliche Figuren & zentrische Streckung', 'M10 LB3', 5, null, false),
  ('ms10-strahlensaetze', 'Strahlensätze', 'M10 LB3', 6, null, false),
  ('ms10-kathetensatz-hoehensatz', 'Kathetensatz und Höhensatz', 'M10 LB3', 7, null, false),
  ('ms10-sinus-kosinus-tangens', 'Sinus, Kosinus, Tangens im rechtwinkligen Dreieck', 'M10 LB4', 8, null, false),
  ('ms10-trigonometrie-sachaufgaben', 'Trigonometrische Sachaufgaben', 'M10 LB4', 9, null, false),
  ('ms10-einheitskreis-periodische-funktionen', 'Einheitskreis & periodische Vorgänge', 'M10 LB4', 10, null, false),
  ('ms10-kugel-oberflaeche-volumen', 'Kugel: Oberfläche und Volumen', 'M10 LB5', 11, 'geometryAreaGenerator', false),
  ('ms10-baumdiagramme-pfadregeln', 'Baumdiagramme & Pfadregeln', 'M10 LB6', 12, null, false),
  ('ms10-kombinatorik-permutationen', 'Kombinatorik: Permutationen', 'M10 LB6', 13, null, false),
  ('ms10-lineare-funktionen-funktionsgleichung', 'Lineare Funktionsgleichungen bestimmen', 'M10 LB7', 14, null, false),
  ('ms10-quadratische-gleichungen', 'Rein-/gemischtquadratische Gleichungen', 'M10 LB7', 15, null, false),
  ('ms10-bruchgleichungen', 'Bruchgleichungen', 'M10 LB7', 16, null, false),
  ('ms10-quadratische-funktionen-normalform-scheitelpunktform', 'Quadratische Funktionen: Normalform ↔ Scheitelpunktform', 'M10 LB7', 17, null, false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 10 and g.school_track = 'mittelschule_m'
on conflict (slug) do nothing;

-- Grade 11 FOS — LehrplanPLUS, confirmed but marked "gültig ab Schuljahr
-- 2017/18" (older than the M10 page) — spot-check against a current
-- textbook/ISB PDF before content lock, non-blocking. Common core (shared
-- by every Ausbildungsrichtung) first, then branch-specific topics
-- (unpublished; see plan's open design question on modeling FOS branches
-- before building these). Pilot: fos11-lineare-quadratische-funktionen.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  -- Common core (LB1-2, ~56 Std., every branch)
  ('fos11-lineare-quadratische-funktionen', 'Lineare & quadratische Funktionen: Eigenschaften und Graphen', 'FOS11 LB1', 1, 'polynomialFunctionsGenerator', true),
  ('fos11-nullstellen-ganzrationaler-funktionen', 'Nullstellen ganzrationaler Funktionen', 'FOS11 LB1', 2, 'polynomialFunctionsGenerator', false),
  ('fos11-verhalten-im-unendlichen-symmetrie', 'Verhalten im Unendlichen & Symmetrie', 'FOS11 LB1', 3, null, false),
  ('fos11-funktionsgraphen-skizzieren-ungleichungen', 'Funktionsgraphen skizzieren & Ungleichungen', 'FOS11 LB1', 4, null, false),
  ('fos11-funktionsterme-aus-eigenschaften-ermitteln', 'Funktionsterm aus Eigenschaften ermitteln', 'FOS11 LB1', 5, null, false),
  ('fos11-differenzenquotient-sekantensteigung', 'Differenzenquotient & Sekantensteigung', 'FOS11 LB2', 6, null, false),
  ('fos11-differenzialquotient-tangentensteigung', 'Differenzialquotient & Tangentensteigung', 'FOS11 LB2', 7, null, false),
  ('fos11-grenzwert-differenzierbarkeit', 'Grenzwert & Differenzierbarkeit', 'FOS11 LB2', 8, null, false),
  ('fos11-monotonie-kruemmung-extrempunkte-wendepunkte', 'Monotonie, Krümmung, Extrem- & Wendepunkte', 'FOS11 LB2', 9, null, false),
  -- Non-Technik branches (ABU, G, S, W, GH, IW): Stochastik (LB3-5)
  ('fos11-zufallsexperiment-ergebnisraum', 'Zufallsexperiment & Ergebnisraum', 'FOS11 LB3', 10, null, false),
  ('fos11-ereignisse-mengenoperationen', 'Ereignisse & Mengenoperationen', 'FOS11 LB3', 11, null, false),
  ('fos11-vierfeldertafel-haeufigkeiten', 'Vierfeldertafel & relative Häufigkeiten', 'FOS11 LB4', 12, null, false),
  ('fos11-laplace-wahrscheinlichkeit', 'Laplace-Wahrscheinlichkeit', 'FOS11 LB4', 13, null, false),
  ('fos11-mehrstufige-zufallsexperimente-baumdiagramme', 'Mehrstufige Zufallsexperimente & Baumdiagramme', 'FOS11 LB4', 14, null, false),
  ('fos11-bedingte-wahrscheinlichkeit-unabhaengigkeit', 'Bedingte Wahrscheinlichkeit & Unabhängigkeit', 'FOS11 LB4', 15, null, false),
  ('fos11-kombinatorik-zaehlprinzip', 'Kombinatorik: Zählprinzip', 'FOS11 LB5', 16, null, false),
  -- Technik branch only: Vektoren/LGS (LB3-4), replaces the Stochastik block above
  ('fos11-t-vektoren-addition-subtraktion-skalarmultiplikation', 'Vektoren: Addition, Subtraktion, Skalarmultiplikation', 'FOS11(T) LB3', 17, null, false),
  ('fos11-t-lineare-abhaengigkeit-basis', 'Lineare (Un-)Abhängigkeit & Basis', 'FOS11(T) LB3', 18, null, false),
  ('fos11-t-lineare-gleichungssysteme-gauss', 'Lineare Gleichungssysteme & Gauß-Verfahren', 'FOS11(T) LB3', 19, null, false),
  ('fos11-t-skalarprodukt-winkel', 'Skalarprodukt & Winkel zwischen Vektoren', 'FOS11(T) LB4', 20, null, false),
  ('fos11-t-vektorprodukt-flaecheninhalt', 'Vektorprodukt & Flächeninhalt', 'FOS11(T) LB4', 21, null, false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 11 and g.school_track = 'fos'
on conflict (slug) do nothing;

-- Exercise catalog: one "generated" exercise definition per (topic, tier 1-5)
-- for the published pilot topics. Each row is just a pointer at a generator
-- + tier; the actual question is rendered per-student at runtime by
-- lib/generators/*.ts (see actions/exercises.ts).
insert into exercises (topic_id, mode, difficulty_tier, generator_key, generator_params, solution_script)
select t.id, 'generated', tier, t.generator_key, '{}'::jsonb, '[]'::jsonb
from topics t
cross join generate_series(1, 5) as tier
where t.slug in ('m5-stellenwertsystem', 'm6-bruchteile', 'ms10-potenzgesetze', 'fos11-lineare-quadratische-funktionen')
  and not exists (
    select 1 from exercises e where e.topic_id = t.id and e.difficulty_tier = tier
  );

-- Milestones (see lib/milestones/checkMilestones.ts for the unlock_rule shapes
-- it understands: lesson_completed by lessonSlug, topic_mastered by topicSlug).
-- No natural unique key on this table, so guard re-running seed.sql with NOT EXISTS.
insert into milestones (grade_id, title, icon_key, sequence_order, unlock_rule)
select g.id, v.title, v.icon_key, v.sequence_order, v.unlock_rule
from (values
  (5, 'gymnasium_g9', 'Erste Lektion: Stellenwertsystem', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "m5-stellenwertsystem-ep1"}'::jsonb),
  (5, 'gymnasium_g9', 'Stellenwertsystem gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "m5-stellenwertsystem"}'::jsonb),
  (6, 'gymnasium_g9', 'Erste Lektion: Bruchteile', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "m6-bruchteile-ep1"}'::jsonb),
  (6, 'gymnasium_g9', 'Brüche gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "m6-bruchteile"}'::jsonb),
  (10, 'mittelschule_m', 'Erste Lektion: Potenzgesetze', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "ms10-potenzgesetze-ep1"}'::jsonb),
  (10, 'mittelschule_m', 'Potenzgesetze gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "ms10-potenzgesetze"}'::jsonb),
  (11, 'fos', 'Erste Lektion: Funktionen', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "fos11-lineare-quadratische-funktionen-ep1"}'::jsonb),
  (11, 'fos', 'Funktionen gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "fos11-lineare-quadratische-funktionen"}'::jsonb)
) as v(grade_number, school_track, title, icon_key, sequence_order, unlock_rule)
join grades g on g.grade_number = v.grade_number and g.school_track = v.school_track::school_track
where not exists (
  select 1 from milestones m where m.grade_id = g.id and m.title = v.title
);
