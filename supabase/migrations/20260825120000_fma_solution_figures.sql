-- Figures that belong to a question's worked solution, not its statement.
--
-- The PhysicsWOOT practice exams carry diagrams inside their solutions (free-body
-- sketches, constructions, plots) that the AAPT exams never had, so there was no
-- column for them. Without one those 22 figures are silently dropped and several
-- solutions read as if they refer to a picture that isn't there.
--
-- Treated exactly like `solution` and `correct_choice`: NOT granted to
-- `authenticated` (20260819150000 revoked the table-wide SELECT, so a new column
-- is hidden by default) and served only by fma_attempt_questions() once the
-- attempt is graded. A solution figure gives the answer away as readily as the
-- prose does -- cf. choice_figure_urls in 20260819180000, which had to be granted
-- because it is needed mid-test.

ALTER TABLE public.fma_questions
  ADD COLUMN IF NOT EXISTS solution_figure_urls TEXT[] DEFAULT '{}';

DROP FUNCTION IF EXISTS public.fma_attempt_questions(uuid);
CREATE FUNCTION public.fma_attempt_questions(p_attempt_id uuid)
RETURNS TABLE (
  id                   text,
  exam_id              text,
  question_num         int,
  statement            text,
  figure_urls          text[],
  choice_figure_urls   jsonb,
  choices              jsonb,
  topics               text[],
  tags                 text[],
  correct_choice       text,
  solution             text,
  solution_figure_urls text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls,
         q.choice_figure_urls, q.choices, q.topics, q.tags,
         CASE WHEN a.status = 'graded' THEN q.correct_choice       ELSE NULL END,
         CASE WHEN a.status = 'graded' THEN q.solution             ELSE NULL END,
         CASE WHEN a.status = 'graded' THEN q.solution_figure_urls ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;
