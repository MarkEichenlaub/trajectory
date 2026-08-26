-- A place for Mark's written feedback on a practice test, shown to the student
-- in the F=ma Progress tab alongside the score. The score and tag breakdown say
-- what happened; this says what to do about it.
--
-- Attached to the attempt rather than to the student: a report is always about
-- one particular sitting, and this way it travels with the per-question detail
-- it refers to.
--
-- Students already have SELECT on their own fma_attempts rows via RLS, so the
-- column is readable with no extra grant. UPDATE was revoked from `authenticated`
-- down to scratch_work_url only (20260819150000_fma_hardening.sql), so a student
-- cannot write or edit their own report -- admin/service-role writes only.

ALTER TABLE public.fma_attempts
  ADD COLUMN IF NOT EXISTS tutor_report text;

COMMENT ON COLUMN public.fma_attempts.tutor_report IS
  'Markdown feedback from the tutor on this attempt. Admin-written, student-readable.';
