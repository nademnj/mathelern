-- Phase 7: adding Mittelschule M10 and FOS 11 programs. Postgres requires
-- ALTER TYPE ... ADD VALUE to commit before the new values can be used, so
-- this must be run (and committed) BEFORE 0006_multi_track_grades.sql.

alter type school_track add value 'mittelschule_m';
alter type school_track add value 'fos';
