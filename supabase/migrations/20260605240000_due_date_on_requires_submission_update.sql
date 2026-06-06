-- When requires_submission is toggled to true on an existing assignment,
-- set its due_date the same way the INSERT trigger does (day before next session),
-- unless the due date has been manually overridden or one is already set.

CREATE OR REPLACE FUNCTION public.set_due_date_on_requires_submission_enabled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_session date;
BEGIN
  -- Only act when requires_submission just became true
  IF NOT (NEW.requires_submission AND NOT OLD.requires_submission) THEN
    RETURN NULL;
  END IF;

  -- Don't overwrite a manually-set due date
  IF NEW.due_date_overridden OR NEW.due_date IS NOT NULL THEN
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

DROP TRIGGER IF EXISTS trg_set_due_date_on_requires_submission_enabled ON public.assignments;

CREATE TRIGGER trg_set_due_date_on_requires_submission_enabled
  AFTER UPDATE OF requires_submission ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_due_date_on_requires_submission_enabled();
