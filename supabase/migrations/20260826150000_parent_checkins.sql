-- Parent check-ins: short, unbilled meetings a parent books from the same
-- scheduling page as a tutoring session.
--
-- Check-ins live in the sessions table so they inherit the booking, Google
-- Calendar sync, reschedule and cancel machinery for free. The cost of that
-- reuse is that every query which assumed "a row in sessions is a paid hour of
-- tutoring" now has to say so explicitly — most importantly the due-date
-- triggers below, which would otherwise pull homework forward to the day before
-- a 15-minute parent call.

-- 1. Session type ------------------------------------------------------------

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_type text NOT NULL DEFAULT 'session';

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_session_type_check;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type IN ('session', 'checkin'));

-- Serves both the "next tutoring session" trigger lookups and the check-in
-- history list.
CREATE INDEX IF NOT EXISTS sessions_student_type_scheduled_idx
  ON public.sessions (student_id, session_type, scheduled_at);

-- 2. Who is invited to a check-in --------------------------------------------
-- Separate from receives_meets on purpose: a check-in is a parents-only call,
-- so the student is normally on the session invite list but not this one, and a
-- parent may want check-ins without being copied on every tutoring session.
ALTER TABLE public.student_contacts
  ADD COLUMN IF NOT EXISTS receives_checkins boolean NOT NULL DEFAULT false;

-- 3. Keep check-ins out of homework due dates ---------------------------------
-- Identical to the originals apart from the session_type filter on each
-- next-session lookup. Redefined rather than patched so the whole function body
-- stays readable in one place.

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

  -- Find next upcoming tutoring session for this student (date in Pacific time).
  -- Parent check-ins are skipped: no homework is reviewed at one, so letting a
  -- check-in win this lookup would move every due date onto the day before it.
  SELECT (scheduled_at AT TIME ZONE 'America/Los_Angeles')::date
    INTO v_next_session
    FROM public.sessions
   WHERE student_id = v_student_id
     AND session_type = 'session'
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
     AND session_type = 'session'
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
     AND session_type = 'session'
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

-- 4. A check-in must never consume a session credit ---------------------------
-- bill-sessions already filters on session_type, but the refund path in
-- delete_session would still hand back a credit for a check-in that somehow got
-- flagged. Guard it at the source instead of trusting every caller.
CREATE OR REPLACE FUNCTION public.delete_session(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_student_id  text;
  v_decremented boolean;
  v_type        text;
begin
  if not public.is_admin() then
    raise exception 'not authorized to delete sessions';
  end if;

  select student_id, coalesce(balance_decremented, false), coalesce(session_type, 'session')
    into v_student_id, v_decremented, v_type
  from public.sessions
  where id = p_session_id
  for update;

  if not found then
    return;
  end if;

  if v_decremented and v_student_id is not null and v_type = 'session' then
    update public.students
      set session_balance = coalesce(session_balance, 0) + 1
    where id = v_student_id;
  end if;

  delete from public.sessions where id = p_session_id;
end;
$$;

-- 5. Leo's parents ------------------------------------------------------------
-- Silvio and Feifei get the check-in invite. Feifei is deliberately included
-- even though she has receives_meets = false: she is off the tutoring-session
-- invites but wants the check-ins.
UPDATE public.student_contacts
   SET receives_checkins = true
 WHERE student_id = 'leo'
   AND email IN ('silvio.savarese@gmail.com', 'feifeili@cs.stanford.edu');
