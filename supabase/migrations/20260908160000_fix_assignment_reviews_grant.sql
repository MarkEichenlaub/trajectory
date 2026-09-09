-- Same bug as 20260903140000 (fluency_skill_notes): assignment_reviews only
-- got `GRANT ALL TO service_role`, never `TO authenticated`. Without the
-- table-level GRANT, the admin's is_admin() RLS policy never gets evaluated,
-- so fetchAssignments()'s embedded assignment_reviews select fails with
-- "permission denied for table assignment_reviews" (found live in
-- SessionLauncher's "Get Ready" flow).

GRANT SELECT, INSERT, UPDATE ON public.assignment_reviews TO authenticated;
