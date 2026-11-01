-- The grade-5 Realschule topic list seeded in 0010 was carried over from
-- the old Gymnasium list and explicitly flagged as unverified. Now that
-- Realschule's actual Fachlehrplan has been checked directly (grades 5 AND
-- 6), six of those placeholders turn out not to belong: "Kreise und
-- Tangenten" and written multiplication/division aren't separate M5
-- Lernbereiche, and -- the clearest miss -- "Achsensymmetrie" belongs to
-- GRADE 6's Fachlehrplan (LB2 "Achsenspiegelung und Symmetrie"), not grade
-- 5. None of these ever had a lesson or exercises (still is_published =
-- false with no generator_key), so deleting them is a no-op for any real
-- content -- nothing cascades.
--
-- Everything else (the new accurate topic lists for grades 5 and 6, the
-- grade-6 Realschule row, exercises, milestones) is seeded by the updated
-- supabase/seed.sql -- run that after this commits.

delete from topics
where slug in (
  'rs5-lagebeziehungen',
  'rs5-koordinatensystem',
  'rs5-kreise-tangenten',
  'rs5-schriftlich-multiplizieren-dividieren',
  'rs5-quader-wuerfel',
  'rs5-achsensymmetrie'
);
