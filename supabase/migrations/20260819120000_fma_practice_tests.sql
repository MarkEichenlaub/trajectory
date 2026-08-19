-- F=ma practice test system: digitized questions, student attempts, per-question answers.
-- Pilot scope: only fma-2024 and fma-2025 get fma_questions rows (see scripts/seed_fma_questions.mjs);
-- schema generalizes to any exam_id already seeded by scripts/seed_fma_exams.mjs.

CREATE TABLE IF NOT EXISTS fma_questions (
  id            TEXT        PRIMARY KEY,             -- 'fma-2024-q07'
  exam_id       TEXT        NOT NULL REFERENCES public.handouts(id) ON DELETE CASCADE,
  question_num  INT         NOT NULL,
  statement     TEXT        NOT NULL,
  figure_urls   TEXT[]      DEFAULT '{}',
  choices       JSONB       NOT NULL,                 -- {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}
  correct_choice TEXT       NOT NULL CHECK (correct_choice IN ('A','B','C','D','E')),
  topics        TEXT[]      DEFAULT '{}',
  tags          TEXT[]      DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (exam_id, question_num)
);

CREATE TABLE IF NOT EXISTS fma_attempts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    TEXT        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_id       TEXT        NOT NULL REFERENCES public.handouts(id) ON DELETE CASCADE,
  mode          TEXT        NOT NULL CHECK (mode IN ('live','paper_first','score_only')),
  status        TEXT        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','graded')),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  score         INT,                                  -- out of 25; null until graded
  scratch_work_url TEXT,                               -- whole-attempt scan, paper_first mode
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fma_attempt_answers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    UUID        NOT NULL REFERENCES public.fma_attempts(id) ON DELETE CASCADE,
  question_id   TEXT        NOT NULL REFERENCES public.fma_questions(id) ON DELETE CASCADE,
  selected_choice TEXT      CHECK (selected_choice IN ('A','B','C','D','E')),
  is_correct    BOOLEAN,
  scratch_work_url TEXT,                               -- per-question, live mode only
  answered_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

ALTER TABLE fma_questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_attempts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_attempt_answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON fma_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fma_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fma_attempt_answers TO authenticated;

-- fma_questions: admin write, everyone linked can read (needed to take a test)
DROP POLICY IF EXISTS "fma_questions: admin all" ON fma_questions;
CREATE POLICY "fma_questions: admin all" ON fma_questions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_questions: authenticated read" ON fma_questions;
CREATE POLICY "fma_questions: authenticated read" ON fma_questions
  FOR SELECT TO authenticated
  USING (true);

-- fma_attempts: admin full CRUD; student CRUD scoped to their own linked students
DROP POLICY IF EXISTS "fma_attempts: admin all" ON fma_attempts;
CREATE POLICY "fma_attempts: admin all" ON fma_attempts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_attempts: linked all" ON fma_attempts;
CREATE POLICY "fma_attempts: linked all" ON fma_attempts
  FOR ALL TO authenticated
  USING (student_id IN (SELECT public.my_student_ids()))
  WITH CHECK (student_id IN (SELECT public.my_student_ids()));

-- fma_attempt_answers: admin full CRUD; student CRUD scoped via parent attempt
DROP POLICY IF EXISTS "fma_attempt_answers: admin all" ON fma_attempt_answers;
CREATE POLICY "fma_attempt_answers: admin all" ON fma_attempt_answers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_attempt_answers: linked all" ON fma_attempt_answers;
CREATE POLICY "fma_attempt_answers: linked all" ON fma_attempt_answers
  FOR ALL TO authenticated
  USING (
    attempt_id IN (SELECT id FROM fma_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  )
  WITH CHECK (
    attempt_id IN (SELECT id FROM fma_attempts WHERE student_id IN (SELECT public.my_student_ids()))
  );

-- Storage: scratch-work uploads. Separate bucket from `submissions` so it isn't
-- coupled to the assignments flow, and uses the current my_student_ids() check
-- (the older `submissions` bucket policy still keys off students.user_id, which
-- predates the invite/link rework and doesn't cover linked accounts).
INSERT INTO storage.buckets (id, name, public)
VALUES ('fma-scratch-work', 'fma-scratch-work', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "fma-scratch-work: linked insert" ON storage.objects;
CREATE POLICY "fma-scratch-work: linked insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fma-scratch-work' AND
    (storage.foldername(name))[1] IN (SELECT public.my_student_ids())
  );

DROP POLICY IF EXISTS "fma-scratch-work: admin write" ON storage.objects;
CREATE POLICY "fma-scratch-work: admin write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'fma-scratch-work' AND public.is_admin())
  WITH CHECK (bucket_id = 'fma-scratch-work' AND public.is_admin());
