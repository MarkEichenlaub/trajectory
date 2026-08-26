-- Restores `also_accepted` to fma_attempt_questions().
--
-- 20260821130000_fma_dual_credit.sql added the column and returned it here so
-- the review page could say "B also credited" on the questions where AAPT
-- accepted more than one answer. Four days later 20260825120000 rebuilt this
-- function to add solution_figure_urls and, in rebuilding it, left
-- `also_accepted` out of the new return type. Nothing failed loudly: the
-- browser simply got `undefined` and FmaAttemptDetail's `q.also_accepted || []`
-- fell back to an empty list.
--
-- Grading was never wrong -- submit_fma_attempt() reads fma_questions directly
-- and has credited the alternatives throughout. Only the explanation was wrong,
-- and it contradicted the score: on the six affected questions a student who
-- picked a credited alternative had it painted red and labelled "your answer"
-- while a different letter was labelled "correct answer", even though the point
-- had been awarded. Worst on fma-2020-a-q14 and fma-2019-b-q17, where every
-- option was credited and so every student saw a "wrong" answer they were in
-- fact given full marks for.
--
-- Adding an OUT column changes the row type, so this must DROP and CREATE;
-- Postgres rejects CREATE OR REPLACE that changes the return type (42P13).
-- The admin bypass from 20260826120000 is carried through unchanged.

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
  also_accepted        text[],
  solution             text,
  solution_figure_urls text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls,
         q.choice_figure_urls, q.choices, q.topics, q.tags,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.correct_choice       ELSE NULL END,
         CASE WHEN a.status = 'graded' OR public.is_admin() THEN q.also_accepted        ELSE NULL END,
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
