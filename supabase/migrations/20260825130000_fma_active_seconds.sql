-- The exam clock counted wall-clock time from started_at, so it kept draining
-- while the student was NOT taking the test. A student who hit "Save & exit",
-- got called away for two hours, and came back found the 75 minutes gone --
-- which is exactly what happened on Leo's AoPS practice exam (he was away
-- ~1h51m after question 1, then overnight after question 12).
--
-- The clock now measures time actually spent in the test. The runner banks
-- active time into active_seconds and flushes it every 15s; the countdown reads
-- from there, so leaving and resuming picks up where it left off. This is also
-- the honest "total time taken" figure to report once the test is submitted --
-- submitted_at - started_at is the same contaminated wall-clock number.

ALTER TABLE public.fma_attempts
  ADD COLUMN IF NOT EXISTS active_seconds int NOT NULL DEFAULT 0;

ALTER TABLE public.fma_attempts DROP CONSTRAINT IF EXISTS fma_attempts_active_seconds_range;
ALTER TABLE public.fma_attempts ADD CONSTRAINT fma_attempts_active_seconds_range
  CHECK (active_seconds >= 0 AND active_seconds <= 86400);

-- Students may not UPDATE fma_attempts except for scratch_work_url (see
-- 20260819150000_fma_hardening.sql), so the clock is banked through an RPC.
--
-- The value is a running total, not a delta, and is clamped monotonically with
-- greatest(): a stale or duplicated flush (two tabs open, a retry after a
-- dropped connection) can never wind the clock backwards, and replaying an old
-- request cannot inflate it either.
CREATE OR REPLACE FUNCTION public.bump_fma_active_seconds(p_attempt_id uuid, p_seconds int)
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt public.fma_attempts;
  v_total   int;
BEGIN
  SELECT * INTO v_attempt FROM public.fma_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF NOT (v_attempt.student_id IN (SELECT public.my_student_ids()) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;

  -- Once submitted the total is final; a late flush from a tab still open in
  -- the background must not keep adding to a graded attempt.
  IF v_attempt.status <> 'in_progress' THEN
    RETURN v_attempt.active_seconds;
  END IF;

  UPDATE public.fma_attempts
     SET active_seconds = greatest(active_seconds, least(coalesce(p_seconds, 0), 86400))
   WHERE id = p_attempt_id
  RETURNING active_seconds INTO v_total;

  RETURN v_total;
END $$;

REVOKE ALL ON FUNCTION public.bump_fma_active_seconds(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.bump_fma_active_seconds(uuid, int) TO authenticated;
