-- Some homework questions present their five choices as separate diagrams
-- rather than text (e.g. "which of these five graphs"), mirroring
-- fma_questions.choice_figure_urls on the real F=ma exams (20260819180000).
-- Discovered when re-extracting week 2 question 1: the export script had been
-- silently collapsing five per-letter graphs into empty-string choice text.

ALTER TABLE public.fma_homework_questions
  ADD COLUMN IF NOT EXISTS choice_figure_urls JSONB DEFAULT '{}';

-- Safe to expose alongside the other display columns (it's diagram content,
-- not the answer key).
GRANT SELECT (
  id, set_id, question_num, question_type, statement, figure_urls, choices,
  choice_figure_urls, topics, tags, created_at
) ON public.fma_homework_questions TO authenticated;

-- fma_homework_attempt_questions() has an explicit RETURNS TABLE column list;
-- Postgres won't let CREATE OR REPLACE change a function's row type, so drop
-- it first.
DROP FUNCTION IF EXISTS public.fma_homework_attempt_questions(uuid);

CREATE OR REPLACE FUNCTION public.fma_homework_attempt_questions(p_attempt_id uuid)
RETURNS TABLE (
  id                   text,
  set_id               text,
  question_num         int,
  question_type        text,
  statement            text,
  figure_urls          text[],
  choices              jsonb,
  choice_figure_urls   jsonb,
  topics               text[],
  tags                 text[],
  correct_choice       text,
  also_accepted        text[],
  solution             text,
  solution_figure_urls text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.set_id, q.question_num, q.question_type, q.statement, q.figure_urls, q.choices,
         q.choice_figure_urls, q.topics, q.tags,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.correct_choice ELSE NULL END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.also_accepted ELSE '{}' END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.solution ELSE NULL END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.solution_figure_urls ELSE '{}' END
  FROM public.fma_homework_attempts a
  JOIN public.fma_homework_questions q ON q.set_id = a.set_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_homework_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_homework_attempt_questions(uuid) TO authenticated;
