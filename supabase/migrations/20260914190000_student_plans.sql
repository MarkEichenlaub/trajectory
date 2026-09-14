-- The plan a student and their family see at the top of Progress and Plan:
-- what we're doing next session, and the month-by-month route to the goal
-- exam. One row per student — this is current state, not a history, so the
-- app upserts by student_id. The PDF progress reports below it stay a log.
--
-- `outline` is the plain text Mark types; the app parses it into month cards:
--   Sep 2026: F=ma Topics
--   > optional note line
--   - a bullet

CREATE TABLE IF NOT EXISTS public.student_plans (
  student_id   text PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  next_session text NOT NULL DEFAULT '',
  outline      text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_plans ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.student_plans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_plans TO authenticated;

DROP POLICY IF EXISTS "student_plans: admin all" ON public.student_plans;
CREATE POLICY "student_plans: admin all" ON public.student_plans FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "student_plans: student read" ON public.student_plans;
CREATE POLICY "student_plans: student read" ON public.student_plans FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_student_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_plans_updated_at ON public.student_plans;

CREATE TRIGGER trg_student_plans_updated_at
  BEFORE UPDATE ON public.student_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_student_plans_updated_at();
