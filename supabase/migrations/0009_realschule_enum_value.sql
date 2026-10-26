-- Switching the track lineup to Mittelschule M10 / Realschule 5 / FOS 11,
-- dropping Gymnasium entirely. Postgres requires ALTER TYPE ... ADD VALUE to
-- commit before the new value can be used, so this must be run (and
-- committed) BEFORE 0010_restructure_tracks.sql.

alter type school_track add value 'realschule';
