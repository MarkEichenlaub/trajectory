-- Some questions' answer options are diagrams rather than text. They were stored
-- as one tall image holding all five panels with the source's own (a)-(e)
-- captions baked in -- which on the AoPS practice exam are lowercase, sitting
-- next to the portal's uppercase A-E radio buttons.
--
-- Splitting them one panel per choice lets each option carry its own picture, so
-- the only lettering anywhere is the portal's, and it matches the real F=ma
-- format everywhere.

ALTER TABLE public.fma_questions
  ADD COLUMN IF NOT EXISTS choice_figure_urls JSONB DEFAULT '{}'::jsonb;

-- correct_choice stays column-revoked (20260819150000); the new column is safe
-- to read, so it has to be added to the student-visible grant explicitly.
GRANT SELECT (choice_figure_urls) ON public.fma_questions TO authenticated;

-- Re-declare the review RPC with the new column in its result.
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
  correct_choice     text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls,
         q.choice_figure_urls, q.choices, q.topics, q.tags,
         CASE WHEN a.status = 'graded' THEN q.correct_choice ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;
