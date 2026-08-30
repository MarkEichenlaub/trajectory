-- Grading an F=ma attempt never touched the assignments table, so a student's
-- portal kept showing the exam as "assigned" even after they finished it and
-- got a score (reported by a parent: exam completed, portal still says
-- assigned). Have both grading RPCs flip the matching assignment to
-- completed once the attempt is graded.

CREATE OR REPLACE FUNCTION public.complete_fma_assignment(p_student_id text, p_exam_id text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.assignments
     SET status = 'completed', completed_date = CURRENT_DATE
   WHERE student_id = p_student_id
     AND problem_id = p_exam_id
     AND status <> 'completed'
$$;

REVOKE ALL ON FUNCTION public.complete_fma_assignment(text, text) FROM public;

-- Same grading logic as 20260821130000_fma_dual_credit.sql, plus the
-- assignment-completion call.
CREATE OR REPLACE FUNCTION public.submit_fma_attempt(p_attempt_id uuid)
RETURNS public.fma_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt public.fma_attempts;
  v_score   int;
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

  UPDATE public.fma_attempts
     SET status = 'graded', score = v_score, submitted_at = now()
   WHERE id = p_attempt_id
  RETURNING * INTO v_attempt;

  PERFORM public.complete_fma_assignment(v_attempt.student_id, v_attempt.exam_id);

  RETURN v_attempt;
END $$;

REVOKE ALL ON FUNCTION public.submit_fma_attempt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_attempt(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_fma_score_only(p_attempt_id uuid, p_score int)
RETURNS public.fma_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt public.fma_attempts;
BEGIN
  SELECT * INTO v_attempt FROM public.fma_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF NOT (v_attempt.student_id IN (SELECT public.my_student_ids()) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;
  IF p_score IS NULL OR p_score < 0 OR p_score > 25 THEN
    RAISE EXCEPTION 'score must be between 0 and 25';
  END IF;

  UPDATE public.fma_attempts
     SET status = 'graded', score = p_score, submitted_at = now()
   WHERE id = p_attempt_id
  RETURNING * INTO v_attempt;

  PERFORM public.complete_fma_assignment(v_attempt.student_id, v_attempt.exam_id);

  RETURN v_attempt;
END $$;

REVOKE ALL ON FUNCTION public.submit_fma_score_only(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_score_only(uuid, int) TO authenticated;

-- Backfill: complete the assignment for any attempt that was already graded
-- before this fix existed (covers Akshatha's stuck exam without a retake).
UPDATE public.assignments a
   SET status = 'completed', completed_date = CURRENT_DATE
  FROM public.fma_attempts f
 WHERE f.student_id = a.student_id
   AND f.exam_id = a.problem_id
   AND f.status = 'graded'
   AND a.status <> 'completed';
