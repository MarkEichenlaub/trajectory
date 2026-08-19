-- Append-only log of every answer click during an F=ma attempt (not just the
-- final selection), so we can reconstruct roughly how long a student spent per
-- question. fma_attempt_answers still holds the current/final choice used for
-- grading; this table is purely a timing/analysis log.

CREATE TABLE IF NOT EXISTS fma_answer_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      UUID        NOT NULL REFERENCES public.fma_attempts(id) ON DELETE CASCADE,
  question_id     TEXT        NOT NULL REFERENCES public.fma_questions(id) ON DELETE CASCADE,
  selected_choice TEXT        NOT NULL CHECK (selected_choice IN ('A','B','C','D','E')),
  clicked_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fma_answer_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON fma_answer_events TO authenticated;
GRANT SELECT, INSERT ON fma_answer_events TO service_role;

DROP POLICY IF EXISTS "fma_answer_events: admin all" ON fma_answer_events;
CREATE POLICY "fma_answer_events: admin all" ON fma_answer_events
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_answer_events: linked insert/read" ON fma_answer_events;
CREATE POLICY "fma_answer_events: linked insert/read" ON fma_answer_events
  FOR ALL TO authenticated
  USING (
    attempt_id IN (SELECT id FROM fma_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  )
  WITH CHECK (
    attempt_id IN (SELECT id FROM fma_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  );
