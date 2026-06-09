-- homework_sets was granted to `authenticated` only (see 20260605230000_homework_sets.sql).
-- The local build_homework_set.py runs as `service_role` (via the secret API key)
-- to read a set, upload its compiled PDF to the homework-sets bucket, and mark the
-- set built. service_role already BYPASSes RLS, but Postgres still checks table
-- privileges first — without this GRANT it gets "permission denied for table
-- homework_sets" (42501). Grant it the CRUD it needs.
grant select, insert, update, delete on public.homework_sets to service_role;
