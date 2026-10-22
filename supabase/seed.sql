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
  (5, 'm5-stellenwertsystem', 'Das Stellenwertsystem & natürliche Zahlen', 'M5 1.1', 1, null, false),
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
  (6, 'm6-bruchteile', 'Bruchteile verstehen', 'M6 1.1', 1, null, false),
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
