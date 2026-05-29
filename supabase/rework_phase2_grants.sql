-- ============================================================================
-- Portal rework — Phase 2 follow-up: table grants for the authenticated role.
--
-- RLS policies decide WHICH rows a user sees, but the table must also be
-- GRANTed to the authenticated role or Postgres returns "permission denied for
-- table" before RLS is even consulted.
--   • progress_reports had no SELECT grant → student Progress&Plan tab errored.
--   • student_contacts had SELECT but no write grants → the linked
--     insert/update/delete policies couldn't take effect for students/parents.
-- Row access stays gated by the RLS policies from phase 0/2.
-- ============================================================================

grant select on public.progress_reports to authenticated;
grant insert, update, delete on public.student_contacts to authenticated;
