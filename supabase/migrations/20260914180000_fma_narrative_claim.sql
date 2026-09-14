-- Atomic claim on an F=ma attempt before the narrative is written.
--
-- The agent used to dedup purely on "is there a row in fma_attempt_narratives",
-- and that row is inserted AFTER the claude call, which takes minutes. Two
-- machines running the task at once would both see no row, both run the
-- analysis, and both email Mark about the same exam. Today only the work laptop
-- has the scheduled task, so nothing has doubled up yet -- this is here so
-- adding the second machine is safe rather than a trap.
--
-- claim_fma_narrative() inserts the claim in one statement. A second caller
-- loses the race and gets false. A claim whose worker died (generated_at still
-- null, claimed_at older than p_stale_minutes) can be taken over, so a crashed
-- pass doesn't strand the attempt unreported forever.

ALTER TABLE public.fma_attempt_narratives
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claimed_by text;

CREATE OR REPLACE FUNCTION public.claim_fma_narrative(
  p_attempt_id    uuid,
  p_student_id    text,
  p_exam_id       text,
  p_claimed_by    text,
  p_stale_minutes int DEFAULT 45
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed boolean;
BEGIN
  INSERT INTO public.fma_attempt_narratives
    (attempt_id, student_id, exam_id, claimed_at, claimed_by)
  VALUES
    (p_attempt_id, p_student_id, p_exam_id, now(), p_claimed_by)
  ON CONFLICT (attempt_id) DO UPDATE
    SET claimed_at = now(),
        claimed_by = p_claimed_by
    -- Only steal a claim that never finished and has gone stale. A row with
    -- generated_at set is a delivered report and is never re-claimed here;
    -- re-running one is what `--attempt <id>` is for.
    WHERE fma_attempt_narratives.generated_at IS NULL
      AND fma_attempt_narratives.claimed_at < now() - make_interval(mins => p_stale_minutes)
  RETURNING true INTO claimed;

  RETURN COALESCE(claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_fma_narrative(uuid, text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_fma_narrative(uuid, text, text, text, int) TO service_role;
