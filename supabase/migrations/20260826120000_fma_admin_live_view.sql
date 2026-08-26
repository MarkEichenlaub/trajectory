-- Mark couldn't see a student's F=ma work until they submitted -- the answer
-- key (and therefore the student's answers/choices display) was gated on
-- a.status = 'graded' with no admin bypass, so an in-progress attempt showed
-- nothing at all in the portal. Let an admin see the key -- and so the
-- student's saved answers -- for any attempt, graded or not; students keep
-- the original graded-only gate.

-- Matches the return shape as of 20260825120000_fma_solution_figures.sql
-- exactly (Postgres won't let CREATE OR REPLACE change the OUT-parameter
-- row type) -- only the CASE conditions gain the is_admin() bypass.
CREATE OR REPLACE FUNCTION public.fma_attempt_questions(p_attempt_id uuid)
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
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.correct_choice       ELSE NULL END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.solution             ELSE NULL END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.solution_figure_urls ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;
