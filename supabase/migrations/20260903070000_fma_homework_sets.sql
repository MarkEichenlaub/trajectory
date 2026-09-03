-- F=ma weekly homework sets: 12 assignable "mini test" packets (one per class
-- week), digitized from AoPS's F=ma Problem Series homework pages via
-- EigenNode/scripts/export_fma_homework.py + scripts/seed_fma_homework.mjs.
--
-- Deliberately a SEPARATE schema from fma_questions/fma_attempts/fma_attempt_answers
-- (the real F=ma practice-exam system), not a variant of it: FmaProgress/AdminFmaView/
-- StudentView all decide "is this an F=ma exam" purely by row existence in those three
-- tables, with no resource_type or naming check. Reusing them for homework would leak
-- every homework attempt into the real exam stats. Each week is also mostly multiple
-- choice but always ends with one multi-part free-response "discussion" problem, which
-- the exam schema's CHECK constraints (choices/correct_choice NOT NULL, letters only)
-- can't represent at all.
--
-- Hardening (column-grant restriction on the answer key, RPC-only grading) is applied
-- from the start here, learned from the exam system needing a follow-up hardening
-- migration (20260819150000_fma_hardening.sql) after its initial launch.

CREATE TABLE IF NOT EXISTS fma_homework_questions (
  id                  TEXT        PRIMARY KEY,          -- 'fma-hw-week01-q01'
  set_id              TEXT        NOT NULL REFERENCES public.handouts(id) ON DELETE CASCADE,
  question_num        INT         NOT NULL,
  question_type       TEXT        NOT NULL DEFAULT 'mc' CHECK (question_type IN ('mc', 'free_response')),
  statement           TEXT        NOT NULL,
  figure_urls         TEXT[]      DEFAULT '{}',
  choices             JSONB,                             -- {"A": "...", ...}; null for free_response
  correct_choice      TEXT        CHECK (correct_choice IN ('A','B','C','D','E')),
  also_accepted       TEXT[]      NOT NULL DEFAULT '{}'
    CHECK (also_accepted <@ ARRAY['A','B','C','D','E'] AND NOT (correct_choice = ANY(also_accepted))),
  solution            TEXT,
  solution_figure_urls TEXT[]     DEFAULT '{}',
  topics              TEXT[]      DEFAULT '{}',
  tags                TEXT[]      DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (set_id, question_num),
  CHECK (question_type = 'free_response' OR (choices IS NOT NULL AND correct_choice IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS fma_homework_attempts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    TEXT        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  set_id        TEXT        NOT NULL REFERENCES public.handouts(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','graded')),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  score         INT,                                     -- out of the set's MC-question count only
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fma_homework_attempt_answers (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id         UUID        NOT NULL REFERENCES public.fma_homework_attempts(id) ON DELETE CASCADE,
  question_id        TEXT        NOT NULL REFERENCES public.fma_homework_questions(id) ON DELETE CASCADE,
  selected_choice    TEXT        CHECK (selected_choice IN ('A','B','C','D','E')),
  free_response_text TEXT,
  is_correct         BOOLEAN,
  answered_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

ALTER TABLE fma_homework_questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_homework_attempts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_homework_attempt_answers ENABLE ROW LEVEL SECURITY;

-- fma_homework_questions: admin write; everyone linked gets a column-restricted
-- read (answer key / solution excluded — same shape as fma_questions hardening).
DROP POLICY IF EXISTS "fma_homework_questions: admin all" ON fma_homework_questions;
CREATE POLICY "fma_homework_questions: admin all" ON fma_homework_questions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_homework_questions: authenticated read" ON fma_homework_questions;
CREATE POLICY "fma_homework_questions: authenticated read" ON fma_homework_questions
  FOR SELECT TO authenticated
  USING (true);

GRANT SELECT (
  id, set_id, question_num, question_type, statement, figure_urls, choices, topics, tags, created_at
) ON public.fma_homework_questions TO authenticated;

-- fma_homework_attempts: admin full CRUD; student CRUD scoped to their own
-- linked students, but only INSERT/DELETE + scratch-free updates directly —
-- status/score/submitted_at are set exclusively by submit_fma_homework_attempt().
DROP POLICY IF EXISTS "fma_homework_attempts: admin all" ON fma_homework_attempts;
CREATE POLICY "fma_homework_attempts: admin all" ON fma_homework_attempts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_homework_attempts: linked all" ON fma_homework_attempts;
CREATE POLICY "fma_homework_attempts: linked all" ON fma_homework_attempts
  FOR ALL TO authenticated
  USING (student_id IN (SELECT public.my_student_ids()))
  WITH CHECK (student_id IN (SELECT public.my_student_ids()));

-- No direct UPDATE grant: status/score/submitted_at are set exclusively by
-- submit_fma_homework_attempt() (SECURITY DEFINER).
GRANT SELECT, INSERT, DELETE ON public.fma_homework_attempts TO authenticated;

-- fma_homework_attempt_answers: admin full CRUD; student CRUD scoped via parent attempt.
DROP POLICY IF EXISTS "fma_homework_attempt_answers: admin all" ON fma_homework_attempt_answers;
CREATE POLICY "fma_homework_attempt_answers: admin all" ON fma_homework_attempt_answers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_homework_attempt_answers: linked all" ON fma_homework_attempt_answers;
CREATE POLICY "fma_homework_attempt_answers: linked all" ON fma_homework_attempt_answers
  FOR ALL TO authenticated
  USING (
    attempt_id IN (SELECT id FROM fma_homework_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  )
  WITH CHECK (
    attempt_id IN (SELECT id FROM fma_homework_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_homework_attempt_answers TO authenticated;

-- Returns an attempt's questions, exposing correct_choice/solution ONLY once
-- the attempt is graded, and only to the owning student (or an admin).
CREATE OR REPLACE FUNCTION public.fma_homework_attempt_questions(p_attempt_id uuid)
RETURNS TABLE (
  id                   text,
  set_id               text,
  question_num         int,
  question_type        text,
  statement            text,
  figure_urls          text[],
  choices              jsonb,
  topics               text[],
  tags                 text[],
  correct_choice       text,
  also_accepted        text[],
  solution             text,
  solution_figure_urls text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.set_id, q.question_num, q.question_type, q.statement, q.figure_urls, q.choices,
         q.topics, q.tags,
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

-- Flips the matching `assignments` row to completed once a homework attempt is
-- graded, mirroring complete_fma_assignment() for the real exams.
CREATE OR REPLACE FUNCTION public.complete_fma_homework_assignment(p_student_id text, p_set_id text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.assignments
     SET status = 'completed', completed_date = CURRENT_DATE
   WHERE student_id = p_student_id
     AND problem_id = p_set_id
     AND status <> 'completed'
$$;

REVOKE ALL ON FUNCTION public.complete_fma_homework_assignment(text, text) FROM public;

-- Grades only the multiple-choice answers (a free-response answer has no
-- correct_choice to compare against, so it's simply excluded from scoring),
-- then marks the attempt graded and completes the assignment.
CREATE OR REPLACE FUNCTION public.submit_fma_homework_attempt(p_attempt_id uuid)
RETURNS public.fma_homework_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_attempt public.fma_homework_attempts;
  v_score   int;
BEGIN
  SELECT * INTO v_attempt FROM public.fma_homework_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF NOT (v_attempt.student_id IN (SELECT public.my_student_ids()) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized for this attempt';
  END IF;

  UPDATE public.fma_homework_attempt_answers ans
     SET is_correct = (
           ans.selected_choice IS NOT NULL
           AND (ans.selected_choice = q.correct_choice OR ans.selected_choice = ANY(q.also_accepted))
         )
    FROM public.fma_homework_questions q
   WHERE ans.question_id = q.id
     AND ans.attempt_id  = p_attempt_id
     AND q.question_type = 'mc';

  SELECT count(*) INTO v_score
    FROM public.fma_homework_attempt_answers ans
    JOIN public.fma_homework_questions q ON q.id = ans.question_id
   WHERE ans.attempt_id = p_attempt_id AND q.question_type = 'mc' AND ans.is_correct;

  UPDATE public.fma_homework_attempts
     SET status = 'graded', score = v_score, submitted_at = now()
   WHERE id = p_attempt_id
  RETURNING * INTO v_attempt;

  PERFORM public.complete_fma_homework_assignment(v_attempt.student_id, v_attempt.set_id);

  RETURN v_attempt;
END $$;

REVOKE ALL ON FUNCTION public.submit_fma_homework_attempt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_homework_attempt(uuid) TO authenticated;
