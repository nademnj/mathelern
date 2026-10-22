-- Store the lesson's per-beat script as structured JSON (array of {beatId, narration})
-- so LessonPlayer can look up a beat's narration by id. script_md remains as a
-- derived, human-readable concatenation (useful for search/export later).

alter table lessons add column script_json jsonb not null default '[]'::jsonb;
