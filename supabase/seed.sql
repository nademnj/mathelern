-- Seed data: grade 5 (Realschule) + grade 10 (Mittelschule M-Zug) + grade 11
-- (FOS). Mittelschule M10 (17/17 topics) and FOS 11's common-core +
-- non-Technik path (16/21 topics — the 5 Technik-only Vektoren topics stay
-- unpublished, see the FOS11 insert's comment) are built out to full
-- lesson+exercise depth. Realschule 5 has just its one pilot topic
-- published, with the rest of its topic list seeded unpublished for later.
-- Topics are marked is_published = true so they're visible to students
-- immediately; flip to false for any topic whose content isn't ready yet.
--
-- Gymnasium was removed (see migrations 0009/0010) -- this file no longer
-- seeds it, and re-running this file will not bring it back.
--
-- grades is keyed by (grade_number, school_track) — see migrations
-- 0005/0006/0009/0010 — so every topics/milestones insert below resolves
-- grade_id via a join rather than a literal integer.

insert into grades (grade_number, label, school_track) values
  (5, '5. Klasse', 'realschule'),
  (10, '10. Klasse (M-Zug)', 'mittelschule_m'),
  (11, '11. Klasse', 'fos')
on conflict (grade_number, school_track) do nothing;

-- Grade 5 (Realschule) — "rs5-" prefix, matching the ms10-/fos11- pattern.
-- LehrplanPLUS ref for the pilot topic confirmed directly against
-- Realschule's own Fachlehrplan (not carried over from Gymnasium); the rest
-- of the list still needs the same spot-check every other track's
-- unpublished topics are waiting on.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('rs5-stellenwertsystem', 'Das Stellenwertsystem & natürliche Zahlen', 'M5 1.1', 1, 'placeValueGenerator', true),
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

-- Grade 10 Mittelschule M-Zug (M10) — LehrplanPLUS, confirmed current
-- ("gültig ab Schuljahr 2022/23"). Full program: all 17 topics published,
-- each with a lesson + a dedicated generator-backed exercise set.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  ('ms10-potenzgesetze', 'Potenzschreibweise & Potenzgesetze', 'M10 LB1', 1, 'powersRootsGenerator', true),
  ('ms10-wurzeln-wurzelgesetze', 'n-te Wurzel & Wurzelgesetze', 'M10 LB1', 2, 'powersRootsGenerator', true),
  ('ms10-logarithmus-einfuehrung', 'Logarithmus zur Exponentenermittlung', 'M10 LB1', 3, 'logarithmGenerator', true),
  ('ms10-exponentielles-wachstum', 'Exponentielles Wachstum & Abnahme', 'M10 LB2', 4, 'exponentialGrowthGenerator', true),
  ('ms10-aehnlichkeit-zentrische-streckung', 'Ähnliche Figuren & zentrische Streckung', 'M10 LB3', 5, 'similarityGenerator', true),
  ('ms10-strahlensaetze', 'Strahlensätze', 'M10 LB3', 6, 'strahlensatzGenerator', true),
  ('ms10-kathetensatz-hoehensatz', 'Kathetensatz und Höhensatz', 'M10 LB3', 7, 'rightTriangleTheoremsGenerator', true),
  ('ms10-sinus-kosinus-tangens', 'Sinus, Kosinus, Tangens im rechtwinkligen Dreieck', 'M10 LB4', 8, 'trigRatioGenerator', true),
  ('ms10-trigonometrie-sachaufgaben', 'Trigonometrische Sachaufgaben', 'M10 LB4', 9, 'trigRatioGenerator', true),
  ('ms10-einheitskreis-periodische-funktionen', 'Einheitskreis & periodische Vorgänge', 'M10 LB4', 10, 'unitCircleGenerator', true),
  ('ms10-kugel-oberflaeche-volumen', 'Kugel: Oberfläche und Volumen', 'M10 LB5', 11, 'sphereGenerator', true),
  ('ms10-baumdiagramme-pfadregeln', 'Baumdiagramme & Pfadregeln', 'M10 LB6', 12, 'treeProbabilityGenerator', true),
  ('ms10-kombinatorik-permutationen', 'Kombinatorik: Permutationen', 'M10 LB6', 13, 'combinatoricsGenerator', true),
  ('ms10-lineare-funktionen-funktionsgleichung', 'Lineare Funktionsgleichungen bestimmen', 'M10 LB7', 14, 'linearFunctionFromPointsGenerator', true),
  ('ms10-quadratische-gleichungen', 'Rein-/gemischtquadratische Gleichungen', 'M10 LB7', 15, 'quadraticEquationGenerator', true),
  ('ms10-bruchgleichungen', 'Bruchgleichungen', 'M10 LB7', 16, 'fractionEquationGenerator', true),
  ('ms10-quadratische-funktionen-normalform-scheitelpunktform', 'Quadratische Funktionen: Normalform ↔ Scheitelpunktform', 'M10 LB7', 17, 'vertexFormConversionGenerator', true)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 10 and g.school_track = 'mittelschule_m'
on conflict (slug) do update set
  generator_key = excluded.generator_key,
  is_published = excluded.is_published;

-- Grade 11 FOS — LehrplanPLUS, confirmed but marked "gültig ab Schuljahr
-- 2017/18" (older than the M10 page) — spot-check against a current
-- textbook/ISB PDF before content lock, non-blocking. Common core (LB1-2)
-- plus the non-Technik Stochastik path (LB3-5) are published — the path
-- ~6 of 7 Ausbildungsrichtungen actually take. The 5 Technik-only Vektoren
-- topics stay unpublished: the schema has no way to represent "which
-- branch is this student in" yet (no students.fos_branch column, no
-- fos_technik school_track) — that needs a deliberate decision before this
-- content is authored, not a silent default.
insert into topics (grade_id, slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
select g.id, v.slug, v.title, v.lehrplan_ref, v.sequence_order, v.generator_key, v.is_published
from (values
  -- Common core (LB1-2, ~56 Std., every branch)
  ('fos11-lineare-quadratische-funktionen', 'Lineare & quadratische Funktionen: Eigenschaften und Graphen', 'FOS11 LB1', 1, 'polynomialFunctionsGenerator', true),
  ('fos11-nullstellen-ganzrationaler-funktionen', 'Nullstellen ganzrationaler Funktionen', 'FOS11 LB1', 2, 'quadraticEquationGenerator', true),
  ('fos11-verhalten-im-unendlichen-symmetrie', 'Verhalten im Unendlichen & Symmetrie', 'FOS11 LB1', 3, 'endBehaviorSymmetryGenerator', true),
  ('fos11-funktionsgraphen-skizzieren-ungleichungen', 'Funktionsgraphen skizzieren & Ungleichungen', 'FOS11 LB1', 4, 'inequalityGenerator', true),
  ('fos11-funktionsterme-aus-eigenschaften-ermitteln', 'Funktionsterm aus Eigenschaften ermitteln', 'FOS11 LB1', 5, 'functionFromZerosGenerator', true),
  ('fos11-differenzenquotient-sekantensteigung', 'Differenzenquotient & Sekantensteigung', 'FOS11 LB2', 6, 'differenceQuotientGenerator', true),
  ('fos11-differenzialquotient-tangentensteigung', 'Differenzialquotient & Tangentensteigung', 'FOS11 LB2', 7, 'derivativeSlopeGenerator', true),
  ('fos11-grenzwert-differenzierbarkeit', 'Grenzwert & Differenzierbarkeit', 'FOS11 LB2', 8, 'limitGenerator', true),
  ('fos11-monotonie-kruemmung-extrempunkte-wendepunkte', 'Monotonie, Krümmung, Extrem- & Wendepunkte', 'FOS11 LB2', 9, 'extremumViaDerivativeGenerator', true),
  -- Non-Technik branches (ABU, G, S, W, GH, IW): Stochastik (LB3-5)
  ('fos11-zufallsexperiment-ergebnisraum', 'Zufallsexperiment & Ergebnisraum', 'FOS11 LB3', 10, 'sampleSpaceGenerator', true),
  ('fos11-ereignisse-mengenoperationen', 'Ereignisse & Mengenoperationen', 'FOS11 LB3', 11, 'setOperationsGenerator', true),
  ('fos11-vierfeldertafel-haeufigkeiten', 'Vierfeldertafel & relative Häufigkeiten', 'FOS11 LB4', 12, 'contingencyTableGenerator', true),
  ('fos11-laplace-wahrscheinlichkeit', 'Laplace-Wahrscheinlichkeit', 'FOS11 LB4', 13, 'laplaceProbabilityGenerator', true),
  ('fos11-mehrstufige-zufallsexperimente-baumdiagramme', 'Mehrstufige Zufallsexperimente & Baumdiagramme', 'FOS11 LB4', 14, 'treeProbabilityGenerator', true),
  ('fos11-bedingte-wahrscheinlichkeit-unabhaengigkeit', 'Bedingte Wahrscheinlichkeit & Unabhängigkeit', 'FOS11 LB4', 15, 'conditionalProbabilityGenerator', true),
  ('fos11-kombinatorik-zaehlprinzip', 'Kombinatorik: Zählprinzip', 'FOS11 LB5', 16, 'countingPrincipleGenerator', true),
  -- Technik branch only: Vektoren/LGS (LB3-4) — unpublished, see comment above.
  ('fos11-t-vektoren-addition-subtraktion-skalarmultiplikation', 'Vektoren: Addition, Subtraktion, Skalarmultiplikation', 'FOS11(T) LB3', 17, null, false),
  ('fos11-t-lineare-abhaengigkeit-basis', 'Lineare (Un-)Abhängigkeit & Basis', 'FOS11(T) LB3', 18, null, false),
  ('fos11-t-lineare-gleichungssysteme-gauss', 'Lineare Gleichungssysteme & Gauß-Verfahren', 'FOS11(T) LB3', 19, null, false),
  ('fos11-t-skalarprodukt-winkel', 'Skalarprodukt & Winkel zwischen Vektoren', 'FOS11(T) LB4', 20, null, false),
  ('fos11-t-vektorprodukt-flaecheninhalt', 'Vektorprodukt & Flächeninhalt', 'FOS11(T) LB4', 21, null, false)
) as v(slug, title, lehrplan_ref, sequence_order, generator_key, is_published)
join grades g on g.grade_number = 11 and g.school_track = 'fos'
on conflict (slug) do update set
  generator_key = excluded.generator_key,
  is_published = excluded.is_published;

-- Exercise catalog: one "generated" exercise definition per (topic, tier 1-5)
-- for the published pilot topics. Each row is just a pointer at a generator
-- + tier; the actual question is rendered per-student at runtime by
-- lib/generators/*.ts (see actions/exercises.ts).
insert into exercises (topic_id, mode, difficulty_tier, generator_key, generator_params, solution_script)
select t.id, 'generated', tier, t.generator_key, '{}'::jsonb, '[]'::jsonb
from topics t
cross join generate_series(1, 5) as tier
where t.generator_key is not null
  and t.is_published = true
  and not exists (
    select 1 from exercises e where e.topic_id = t.id and e.difficulty_tier = tier
  );

-- Milestones (see lib/milestones/checkMilestones.ts for the unlock_rule shapes
-- it understands: lesson_completed by lessonSlug, topic_mastered by topicSlug).
-- No natural unique key on this table, so guard re-running seed.sql with NOT EXISTS.
insert into milestones (grade_id, title, icon_key, sequence_order, unlock_rule)
select g.id, v.title, v.icon_key, v.sequence_order, v.unlock_rule
from (values
  (5, 'realschule', 'Erste Lektion: Stellenwertsystem', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "rs5-stellenwertsystem-ep1"}'::jsonb),
  (5, 'realschule', 'Stellenwertsystem gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "rs5-stellenwertsystem"}'::jsonb),
  (10, 'mittelschule_m', 'Erste Lektion: Potenzgesetze', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "ms10-potenzgesetze-ep1"}'::jsonb),
  (10, 'mittelschule_m', 'Potenzgesetze gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "ms10-potenzgesetze"}'::jsonb),
  (10, 'mittelschule_m', 'Wurzeln gemeistert', 'trophy', 3, '{"type": "topic_mastered", "topicSlug": "ms10-wurzeln-wurzelgesetze"}'::jsonb),
  (10, 'mittelschule_m', 'Logarithmus gemeistert', 'trophy', 4, '{"type": "topic_mastered", "topicSlug": "ms10-logarithmus-einfuehrung"}'::jsonb),
  (10, 'mittelschule_m', 'Exponentielles Wachstum gemeistert', 'trophy', 5, '{"type": "topic_mastered", "topicSlug": "ms10-exponentielles-wachstum"}'::jsonb),
  (10, 'mittelschule_m', 'Ähnlichkeit gemeistert', 'trophy', 6, '{"type": "topic_mastered", "topicSlug": "ms10-aehnlichkeit-zentrische-streckung"}'::jsonb),
  (10, 'mittelschule_m', 'Strahlensätze gemeistert', 'trophy', 7, '{"type": "topic_mastered", "topicSlug": "ms10-strahlensaetze"}'::jsonb),
  (10, 'mittelschule_m', 'Höhensatz gemeistert', 'trophy', 8, '{"type": "topic_mastered", "topicSlug": "ms10-kathetensatz-hoehensatz"}'::jsonb),
  (10, 'mittelschule_m', 'Trigonometrie gemeistert', 'trophy', 9, '{"type": "topic_mastered", "topicSlug": "ms10-sinus-kosinus-tangens"}'::jsonb),
  (10, 'mittelschule_m', 'Trigonometrische Sachaufgaben gemeistert', 'trophy', 10, '{"type": "topic_mastered", "topicSlug": "ms10-trigonometrie-sachaufgaben"}'::jsonb),
  (10, 'mittelschule_m', 'Einheitskreis gemeistert', 'trophy', 11, '{"type": "topic_mastered", "topicSlug": "ms10-einheitskreis-periodische-funktionen"}'::jsonb),
  (10, 'mittelschule_m', 'Kugel gemeistert', 'trophy', 12, '{"type": "topic_mastered", "topicSlug": "ms10-kugel-oberflaeche-volumen"}'::jsonb),
  (10, 'mittelschule_m', 'Baumdiagramme gemeistert', 'trophy', 13, '{"type": "topic_mastered", "topicSlug": "ms10-baumdiagramme-pfadregeln"}'::jsonb),
  (10, 'mittelschule_m', 'Kombinatorik gemeistert', 'trophy', 14, '{"type": "topic_mastered", "topicSlug": "ms10-kombinatorik-permutationen"}'::jsonb),
  (10, 'mittelschule_m', 'Lineare Funktionsgleichungen gemeistert', 'trophy', 15, '{"type": "topic_mastered", "topicSlug": "ms10-lineare-funktionen-funktionsgleichung"}'::jsonb),
  (10, 'mittelschule_m', 'Quadratische Gleichungen gemeistert', 'trophy', 16, '{"type": "topic_mastered", "topicSlug": "ms10-quadratische-gleichungen"}'::jsonb),
  (10, 'mittelschule_m', 'Bruchgleichungen gemeistert', 'trophy', 17, '{"type": "topic_mastered", "topicSlug": "ms10-bruchgleichungen"}'::jsonb),
  (10, 'mittelschule_m', 'Scheitelpunktform gemeistert', 'trophy', 18, '{"type": "topic_mastered", "topicSlug": "ms10-quadratische-funktionen-normalform-scheitelpunktform"}'::jsonb),
  (11, 'fos', 'Erste Lektion: Funktionen', 'book-open', 1, '{"type": "lesson_completed", "lessonSlug": "fos11-lineare-quadratische-funktionen-ep1"}'::jsonb),
  (11, 'fos', 'Funktionen gemeistert', 'trophy', 2, '{"type": "topic_mastered", "topicSlug": "fos11-lineare-quadratische-funktionen"}'::jsonb),
  (11, 'fos', 'Nullstellen gemeistert', 'trophy', 3, '{"type": "topic_mastered", "topicSlug": "fos11-nullstellen-ganzrationaler-funktionen"}'::jsonb),
  (11, 'fos', 'Symmetrie gemeistert', 'trophy', 4, '{"type": "topic_mastered", "topicSlug": "fos11-verhalten-im-unendlichen-symmetrie"}'::jsonb),
  (11, 'fos', 'Ungleichungen gemeistert', 'trophy', 5, '{"type": "topic_mastered", "topicSlug": "fos11-funktionsgraphen-skizzieren-ungleichungen"}'::jsonb),
  (11, 'fos', 'Funktionsterme gemeistert', 'trophy', 6, '{"type": "topic_mastered", "topicSlug": "fos11-funktionsterme-aus-eigenschaften-ermitteln"}'::jsonb),
  (11, 'fos', 'Differenzenquotient gemeistert', 'trophy', 7, '{"type": "topic_mastered", "topicSlug": "fos11-differenzenquotient-sekantensteigung"}'::jsonb),
  (11, 'fos', 'Differenzialquotient gemeistert', 'trophy', 8, '{"type": "topic_mastered", "topicSlug": "fos11-differenzialquotient-tangentensteigung"}'::jsonb),
  (11, 'fos', 'Grenzwerte gemeistert', 'trophy', 9, '{"type": "topic_mastered", "topicSlug": "fos11-grenzwert-differenzierbarkeit"}'::jsonb),
  (11, 'fos', 'Extrempunkte gemeistert', 'trophy', 10, '{"type": "topic_mastered", "topicSlug": "fos11-monotonie-kruemmung-extrempunkte-wendepunkte"}'::jsonb),
  (11, 'fos', 'Ergebnisraum gemeistert', 'trophy', 11, '{"type": "topic_mastered", "topicSlug": "fos11-zufallsexperiment-ergebnisraum"}'::jsonb),
  (11, 'fos', 'Mengenoperationen gemeistert', 'trophy', 12, '{"type": "topic_mastered", "topicSlug": "fos11-ereignisse-mengenoperationen"}'::jsonb),
  (11, 'fos', 'Vierfeldertafel gemeistert', 'trophy', 13, '{"type": "topic_mastered", "topicSlug": "fos11-vierfeldertafel-haeufigkeiten"}'::jsonb),
  (11, 'fos', 'Laplace-Wahrscheinlichkeit gemeistert', 'trophy', 14, '{"type": "topic_mastered", "topicSlug": "fos11-laplace-wahrscheinlichkeit"}'::jsonb),
  (11, 'fos', 'Baumdiagramme gemeistert', 'trophy', 15, '{"type": "topic_mastered", "topicSlug": "fos11-mehrstufige-zufallsexperimente-baumdiagramme"}'::jsonb),
  (11, 'fos', 'Bedingte Wahrscheinlichkeit gemeistert', 'trophy', 16, '{"type": "topic_mastered", "topicSlug": "fos11-bedingte-wahrscheinlichkeit-unabhaengigkeit"}'::jsonb),
  (11, 'fos', 'Zählprinzip gemeistert', 'trophy', 17, '{"type": "topic_mastered", "topicSlug": "fos11-kombinatorik-zaehlprinzip"}'::jsonb)
) as v(grade_number, school_track, title, icon_key, sequence_order, unlock_rule)
join grades g on g.grade_number = v.grade_number and g.school_track = v.school_track::school_track
where not exists (
  select 1 from milestones m where m.grade_id = g.id and m.title = v.title
);
