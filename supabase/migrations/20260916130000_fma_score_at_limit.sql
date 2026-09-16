-- Two scores for one sitting: what they had when the 75 minutes ran out, and
-- what they had when they stopped.
--
-- Going past the limit has always been allowed on a practice test -- finishing
-- the questions teaches more than the deadline does -- but until now the only
-- number kept was the final one, so an exam finished in 110 minutes looked like
-- a 20 next to a real sitting's 20. Both numbers are worth having: the first
-- says where they'd land on the real F=ma, the second says what they can do
-- when the clock isn't the constraint.
--
-- Nothing new has to be captured to work the first one out. Every answer click
-- in live mode already writes an fma_answer_events row stamped with the exam
-- clock (which pauses whenever the test isn't on screen), so "what was selected
-- at the 4500-second mark" is a query over rows that already exist -- which is
-- also what makes the backfill at the bottom possible.

ALTER TABLE public.fma_attempts
  ADD COLUMN IF NOT EXISTS score_at_limit int;

COMMENT ON COLUMN public.fma_attempts.score_at_limit IS
  'Score counting only the answers standing when the 75-minute exam clock ran '
  'out. Equal to score when the sitting never went over. Null when it cannot be '
  'worked out (no clock-stamped answer events).';

-- The answer standing for each question at p_limit seconds of exam clock,
-- graded. NULL (rather than 0) when the attempt has no stamped answer events at
-- all -- a paper-first entry, or a live attempt from before the clock stamps
-- existed -- so callers can fall back to the final score instead of recording a
-- fictitious zero.
CREATE OR REPLACE FUNCTION public.fma_score_at_limit(p_attempt_id uuid, p_limit int DEFAULT 4500)
RETURNS int
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_score int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.fma_answer_events
     WHERE attempt_id = p_attempt_id AND event_type = 'answer' AND active_seconds IS NOT NULL
  ) THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int INTO v_score
  FROM (
    -- The LAST answer clicked on each question at or before the cutoff: a
    -- student who changed their mind at 70 minutes is credited with the change,
    -- and one who changed it at 80 is not.
    SELECT DISTINCT ON (e.question_id) e.question_id, e.selected_choice
      FROM public.fma_answer_events e
     WHERE e.attempt_id = p_attempt_id
       AND e.event_type = 'answer'
       AND e.active_seconds IS NOT NULL
       AND e.active_seconds <= p_limit
     ORDER BY e.question_id, e.active_seconds DESC, e.clicked_at DESC
  ) standing
  JOIN public.fma_questions q ON q.id = standing.question_id
  WHERE standing.selected_choice IS NOT NULL
    AND (standing.selected_choice = q.correct_choice
         OR standing.selected_choice = ANY(coalesce(q.also_accepted, '{}')));

  RETURN coalesce(v_score, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.fma_score_at_limit(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_score_at_limit(uuid, int) TO authenticated, service_role;

-- Grading now records both numbers in the same atomic statement as the score
-- itself. Unchanged from 20260829200000 apart from score_at_limit.
CREATE OR REPLACE FUNCTION public.submit_fma_attempt(p_attempt_id uuid)
RETURNS public.fma_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt  public.fma_attempts;
  v_score    int;
  v_at_limit int;
BEGIN
  SELECT * INTO v_attempt FROM public.fma_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF NOT (v_attempt.student_id IN (SELECT public.my_student_ids()) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;
  IF v_attempt.mode = 'score_only' THEN
    RAISE EXCEPTION 'score_only attempts use submit_fma_score_only()';
  END IF;

  UPDATE public.fma_attempt_answers ans
     SET is_correct = (
           ans.selected_choice IS NOT NULL
           AND (ans.selected_choice = q.correct_choice
                OR ans.selected_choice = ANY(q.also_accepted))
         )
    FROM public.fma_questions q
   WHERE ans.question_id = q.id
     AND ans.attempt_id  = p_attempt_id;

  SELECT count(*) INTO v_score
    FROM public.fma_attempt_answers
   WHERE attempt_id = p_attempt_id AND is_correct;

  -- A sitting that stayed inside the limit has one score wearing two hats.
  -- Only one that ran over needs the clock replayed.
  IF coalesce(v_attempt.active_seconds, 0) <= 4500 THEN
    v_at_limit := v_score;
  ELSE
    v_at_limit := coalesce(public.fma_score_at_limit(p_attempt_id), v_score);
  END IF;

  UPDATE public.fma_attempts
     SET status = 'graded', score = v_score, score_at_limit = v_at_limit, submitted_at = now()
   WHERE id = p_attempt_id
  RETURNING * INTO v_attempt;

  PERFORM public.complete_fma_assignment(v_attempt.student_id, v_attempt.exam_id);

  RETURN v_attempt;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_fma_attempt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_attempt(uuid) TO authenticated;

-- score_at_limit is derived from the event log, never sent by the browser.
REVOKE UPDATE ON public.fma_attempts FROM authenticated;
GRANT UPDATE (scratch_work_url) ON public.fma_attempts TO authenticated;

-- ── Backfill every attempt already taken ────────────────────────────────────
UPDATE public.fma_attempts a
   SET score_at_limit = CASE
         WHEN a.score IS NULL THEN NULL
         WHEN coalesce(a.active_seconds, 0) <= 4500 THEN a.score
         ELSE coalesce(public.fma_score_at_limit(a.id), a.score)
       END
 WHERE a.score_at_limit IS NULL
   AND a.status IN ('submitted', 'graded');
