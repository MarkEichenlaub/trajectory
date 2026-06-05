-- Adds due dates, multi-file submissions, and assignment reminder toggle.

-- 1. Add requires_submission (default false) and due date columns
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS requires_submission boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS due_date_overridden boolean NOT NULL DEFAULT false;

-- 3. Create assignment_submissions table (replaces single submission_url column)
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id text NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_url      text NOT NULL,
  file_name     text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.assignment_submissions TO service_role;
GRANT SELECT ON public.assignment_submissions TO authenticated;

CREATE POLICY "assignment_submissions: self read"
  ON public.assignment_submissions FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM public.assignments
      WHERE student_id IN (
        SELECT id FROM public.students WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "assignment_submissions: admin read"
  ON public.assignment_submissions FOR SELECT
  USING (public.is_admin());

-- 4. Backfill existing submission_url values into assignment_submissions
INSERT INTO public.assignment_submissions (assignment_id, file_url, file_name, created_at)
SELECT
  id,
  submission_url,
  NULL,
  COALESCE(submission_at, created_at)
FROM public.assignments
WHERE submission_url IS NOT NULL AND submission_url <> ''
ON CONFLICT DO NOTHING;

-- 5. Add reminder toggle to student_contacts (off by default for everyone)
ALTER TABLE public.student_contacts
  ADD COLUMN IF NOT EXISTS receives_assignment_reminders boolean NOT NULL DEFAULT false;

-- 6. Postgres trigger: auto-recalculate due dates when sessions change.
-- After any INSERT/UPDATE/DELETE on sessions, finds the next upcoming session
-- for the affected student and sets due_date = that date - 1 day for all
-- non-overridden assigned/submitted assignments that require submission.
-- If no upcoming session exists, clears due_date to NULL.

CREATE OR REPLACE FUNCTION public.recalc_assignment_due_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id   text;
  v_next_session date;
BEGIN
  -- Determine which student was affected
  IF TG_OP = 'DELETE' THEN
    v_student_id := OLD.student_id;
  ELSE
    v_student_id := NEW.student_id;
  END IF;

  -- Find next upcoming session for this student (date in Pacific time)
  SELECT (scheduled_at AT TIME ZONE 'America/Los_Angeles')::date
    INTO v_next_session
    FROM public.sessions
   WHERE student_id = v_student_id
     AND scheduled_at > now()
   ORDER BY scheduled_at ASC
   LIMIT 1;

  -- Update due_date for all non-overridden assigned/submitted assignments
  -- that require submission for this student
  UPDATE public.assignments
     SET due_date = CASE
                      WHEN v_next_session IS NOT NULL THEN v_next_session - 1
                      ELSE NULL
                    END
   WHERE student_id = v_student_id
     AND requires_submission = true
     AND due_date_overridden = false
     AND status IN ('assigned', 'submitted');

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_assignment_due_dates ON public.sessions;

CREATE TRIGGER trg_recalc_assignment_due_dates
  AFTER INSERT OR UPDATE OR DELETE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_assignment_due_dates();

-- 7. Trigger: set initial due_date when a new assignment is inserted.
-- Handles the case where a future session already exists at assignment time.

CREATE OR REPLACE FUNCTION public.set_initial_assignment_due_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_session date;
BEGIN
  IF NOT NEW.requires_submission THEN
    RETURN NULL;
  END IF;

  SELECT (scheduled_at AT TIME ZONE 'America/Los_Angeles')::date
    INTO v_next_session
    FROM public.sessions
   WHERE student_id = NEW.student_id
     AND scheduled_at > now()
   ORDER BY scheduled_at ASC
   LIMIT 1;

  IF v_next_session IS NOT NULL THEN
    UPDATE public.assignments
       SET due_date = v_next_session - 1
     WHERE id = NEW.id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_initial_assignment_due_date ON public.assignments;

CREATE TRIGGER trg_set_initial_assignment_due_date
  AFTER INSERT ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_initial_assignment_due_date();
