-- Hardening pass on the F=ma practice-test system, from a pre-launch review.
--
-- Fixes, in order of severity:
--   1. Scratch-work upload was rejected for every student (upsert needs UPDATE).
--   2. The answer key was readable by any logged-in student in one request.
--   3. Scores were forgeable with a direct PATCH, and unbounded.
--   4. Per-question timing was derived from answer clicks alone, which
--      mis-attributes time; we now log question-view events too.

-- ── 1. Storage: students may overwrite their own scratch work ───────────────
-- The app uploads with { upsert: true }. Supabase treats an upsert as needing
-- UPDATE (and SELECT to find the existing row), but the original migration only
-- granted INSERT, so EVERY student upload failed with
-- "new row violates row-level security policy". Admins were unaffected because
-- their policy is FOR ALL.

DROP POLICY IF EXISTS "fma-scratch-work: linked update" ON storage.objects;
CREATE POLICY "fma-scratch-work: linked update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'fma-scratch-work' AND
    (storage.foldername(name))[1] IN (SELECT public.my_student_ids())
  )
  WITH CHECK (
    bucket_id = 'fma-scratch-work' AND
    (storage.foldername(name))[1] IN (SELECT public.my_student_ids())
  );

DROP POLICY IF EXISTS "fma-scratch-work: linked read" ON storage.objects;
CREATE POLICY "fma-scratch-work: linked read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'fma-scratch-work' AND
    (storage.foldername(name))[1] IN (SELECT public.my_student_ids())
  );

-- ── 2. Hide the answer key behind column grants ─────────────────────────────
-- RLS cannot hide a column, so `correct_choice` needs a column-level grant.
-- Students (and admins, who share the `authenticated` role) can no longer read
-- it directly; the key is served only by fma_attempt_questions() below, and
-- only for an attempt that has already been graded.

REVOKE SELECT ON public.fma_questions FROM authenticated;
GRANT SELECT (
  id, exam_id, question_num, statement, figure_urls, choices, topics, tags, created_at
) ON public.fma_questions TO authenticated;

-- Returns an attempt's questions, exposing correct_choice ONLY once the attempt
-- is graded, and only to the owning student (or an admin). SECURITY DEFINER so
-- it can read the restricted column on the caller's behalf.
CREATE OR REPLACE FUNCTION public.fma_attempt_questions(p_attempt_id uuid)
RETURNS TABLE (
  id             text,
  exam_id        text,
  question_num   int,
  statement      text,
  figure_urls    text[],
  choices        jsonb,
  topics         text[],
  tags           text[],
  correct_choice text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.exam_id, q.question_num, q.statement, q.figure_urls, q.choices,
         q.topics, q.tags,
         CASE WHEN a.status = 'graded' THEN q.correct_choice ELSE NULL END
  FROM public.fma_attempts a
  JOIN public.fma_questions q ON q.exam_id = a.exam_id
  WHERE a.id = p_attempt_id
    AND (a.student_id IN (SELECT public.my_student_ids()) OR public.is_admin())
  ORDER BY q.question_num
$$;

REVOKE ALL ON FUNCTION public.fma_attempt_questions(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.fma_attempt_questions(uuid) TO authenticated;

-- ── 3. Grading moves server-side; scores stop being client-writable ─────────

ALTER TABLE public.fma_attempts DROP CONSTRAINT IF EXISTS fma_attempts_score_range;
ALTER TABLE public.fma_attempts ADD CONSTRAINT fma_attempts_score_range
  CHECK (score IS NULL OR (score >= 0 AND score <= 25));

-- Students keep INSERT (start an attempt) and DELETE (cancel an empty one), but
-- may now only update scratch_work_url. status/score/submitted_at are set
-- exclusively by the two RPCs below.
REVOKE UPDATE ON public.fma_attempts FROM authenticated;
GRANT UPDATE (scratch_work_url) ON public.fma_attempts TO authenticated;

-- Grades a live/paper_first attempt against the key in a single statement.
-- Replaces the old client-side loop, which issued 25 non-atomic UPDATEs and
-- trusted the browser with the resulting score.
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
     SET is_correct = (ans.selected_choice IS NOT NULL AND ans.selected_choice = q.correct_choice)
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

-- score_only mode stays self-reported by design, but the value is now
-- range-checked server-side rather than trusted from the client.
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

  RETURN v_attempt;
END $$;

REVOKE ALL ON FUNCTION public.submit_fma_score_only(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_fma_score_only(uuid, int) TO authenticated;

-- ── 4. Log question views, not just answer clicks ──────────────────────────
-- Time-per-question was previously inferred from the gap between answer clicks,
-- which credits each question with the NEXT question's thinking time and loses
-- skipped questions entirely. A 'view' event is now written whenever a question
-- becomes the active one, so a span can be attributed to the question actually
-- on screen.

ALTER TABLE public.fma_answer_events ALTER COLUMN selected_choice DROP NOT NULL;

ALTER TABLE public.fma_answer_events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'answer';

ALTER TABLE public.fma_answer_events DROP CONSTRAINT IF EXISTS fma_answer_events_type_chk;
ALTER TABLE public.fma_answer_events ADD CONSTRAINT fma_answer_events_type_chk
  CHECK (event_type IN ('answer', 'view'));

-- An 'answer' event must carry a choice; a 'view' event must not.
ALTER TABLE public.fma_answer_events DROP CONSTRAINT IF EXISTS fma_answer_events_choice_chk;
ALTER TABLE public.fma_answer_events ADD CONSTRAINT fma_answer_events_choice_chk
  CHECK (
    (event_type = 'answer' AND selected_choice IS NOT NULL) OR
    (event_type = 'view'   AND selected_choice IS NULL)
  );

CREATE INDEX IF NOT EXISTS fma_answer_events_attempt_time_idx
  ON public.fma_answer_events (attempt_id, clicked_at);
