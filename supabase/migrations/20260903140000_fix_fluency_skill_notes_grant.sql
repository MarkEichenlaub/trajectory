-- Fixes a bug from the original fluency migration (20260903050000): every
-- other fluency table got a `GRANT ... TO authenticated` before its RLS
-- policy, but fluency_skill_notes only got `GRANT ALL TO service_role`. In
-- Postgres, RLS policies only filter rows among privileges you already have
-- -- without the table-level GRANT, admin's own is_admin() policy never even
-- gets evaluated, and every query fails with "permission denied for table
-- fluency_skill_notes" (found live while testing the admin Fluency panel).

GRANT SELECT, INSERT, UPDATE ON public.fluency_skill_notes TO authenticated;
