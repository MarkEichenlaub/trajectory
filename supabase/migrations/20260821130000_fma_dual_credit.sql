-- Some F=ma questions have more than one answer that AAPT awarded credit for --
-- usually because a question turned out to be ambiguous or carried a typo, and
-- occasionally because two options are genuinely equivalent.
--
-- Until now fma_questions could hold exactly one answer, so a student who
-- picked an officially-credited alternative was marked wrong. `also_accepted`
-- holds the extra letters; `correct_choice` stays the canonical answer, so
-- everything that reads it keeps working.
--
-- Like correct_choice and solution, this leaks the key, so it is NOT added to
-- the column grant for `authenticated` (the table-wide SELECT was revoked in
-- 20260819150000, so a new column is hidden by default) and is served only by
-- fma_attempt_questions() once the attempt is graded.

ALTER TABLE public.fma_questions
  ADD COLUMN IF NOT EXISTS also_accepted TEXT[] NOT NULL DEFAULT '{}';

-- Letters only, and never a restatement of correct_choice -- keeping the two
-- disjoint means "is this choice the canonical answer?" has one answer.
ALTER TABLE public.fma_questions DROP CONSTRAINT IF EXISTS fma_questions_also_accepted_chk;
ALTER TABLE public.fma_questions ADD CONSTRAINT fma_questions_also_accepted_chk
  CHECK (
    also_accepted <@ ARRAY['A','B','C','D','E']::text[]
    AND NOT (correct_choice = ANY(also_accepted))
  );

-- ── Grading now credits the alternatives ───────────────────────────────────
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

  RETURN v_attempt;
END $$;

REVOKE ALL ON FUNCTION public.submit_fma_attempt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_attempt(uuid) TO authenticated;

-- ── Review RPC returns the alternatives, gated on `graded` like the key ────
DROP FUNCTION IF EXISTS public.fma_attempt_questions(uuid);
CREATE FUNCTION public.fma_attempt_questions(p_attempt_id uuid)
RETURNS TABLE (
  id                 text,
  exam_id            text,
  question_num       int,
  statement          text,
  figure_urls        text[],
  choice_figure_urls jsonb,
  choices            jsonb,
  topics             text[],
  tags               text[],
  correct_choice     text,
  also_accepted      text[],
  solution           text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls,
         q.choice_figure_urls, q.choices, q.topics, q.tags,
         CASE WHEN a.status = 'graded' THEN q.correct_choice ELSE NULL END,
         CASE WHEN a.status = 'graded' THEN q.also_accepted  ELSE NULL END,
         CASE WHEN a.status = 'graded' THEN q.solution       ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;

-- ── Re-grade attempts already sitting in the database ──────────────────────
-- Without this, an attempt graded before today keeps a score computed against
-- the single-answer rule, and the review page would show a question marked
-- wrong while the UI labels the student's choice as accepted.
UPDATE public.fma_attempt_answers ans
   SET is_correct = (
         ans.selected_choice IS NOT NULL
         AND (ans.selected_choice = q.correct_choice
              OR ans.selected_choice = ANY(q.also_accepted))
       )
  FROM public.fma_questions q, public.fma_attempts a
 WHERE ans.question_id = q.id
   AND ans.attempt_id = a.id
   AND a.status = 'graded'
   AND a.mode <> 'score_only';

UPDATE public.fma_attempts a
   SET score = s.n
  FROM (
    SELECT attempt_id, count(*) FILTER (WHERE is_correct) AS n
      FROM public.fma_attempt_answers GROUP BY attempt_id
  ) s
 WHERE s.attempt_id = a.id
   AND a.status = 'graded'
   AND a.mode <> 'score_only'
   AND a.score IS DISTINCT FROM s.n;
