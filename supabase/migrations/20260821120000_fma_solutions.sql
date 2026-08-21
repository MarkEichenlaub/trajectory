-- Worked solutions for F=ma questions, shown behind a "Show Solution" toggle on
-- the review page for a graded attempt.
--
-- A solution gives the answer away, so it is treated exactly like
-- correct_choice: NOT included in the column grant to `authenticated`
-- (20260819150000 revoked the table-wide SELECT, so a new column is hidden by
-- default), and served only by fma_attempt_questions() once the attempt is
-- graded.

ALTER TABLE public.fma_questions
  ADD COLUMN IF NOT EXISTS solution TEXT;

-- Deliberately no `GRANT SELECT (solution)` here -- cf. choice_figure_urls in
-- 20260819180000, which is safe to read mid-test and so had to be granted.

-- Re-declare the review RPC with the solution in its result, gated on `graded`
-- alongside the answer key.
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
  solution           text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls,
         q.choice_figure_urls, q.choices, q.topics, q.tags,
         CASE WHEN a.status = 'graded' THEN q.correct_choice ELSE NULL END,
         CASE WHEN a.status = 'graded' THEN q.solution      ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;
