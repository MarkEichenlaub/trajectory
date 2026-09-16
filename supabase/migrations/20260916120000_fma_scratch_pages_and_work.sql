-- One upload of all the work, split into per-question pieces afterwards.
--
-- The runner has always taken a single whole-test scan, but the upload row sat
-- under every question, so it read as "attach your work for THIS question" --
-- Akshatha said as much, and no student has ever completed an upload. The
-- control now lives once, on the review screen, and it takes several files,
-- because a 25-question sitting is several sheets of paper.
--
-- fma_scratch_pages is those sheets. fma_question_work is where each question's
-- work sits on them: a normalized box per question, written by
-- scripts/fma-work-splitter.mjs, which reads each page through `claude -p` and
-- says "question 7's work is this rectangle". Nothing is re-cropped and stored
-- as new files -- the review page draws the page image through the box, which
-- means a bad box can be fixed by rewriting four numbers.

CREATE TABLE IF NOT EXISTS public.fma_scratch_pages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    uuid NOT NULL REFERENCES public.fma_attempts(id) ON DELETE CASCADE,
  page_index    int  NOT NULL,
  storage_path  text NOT NULL,          -- object path in the private fma-scratch-work bucket
  file_name     text,                   -- what the student called it, for the page label
  -- Pixel size of the page, needed to turn a normalized box back into a crop
  -- with the right aspect ratio. Null until the splitter measures it.
  width         int,
  height        int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, page_index)
);

CREATE TABLE IF NOT EXISTS public.fma_question_work (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id   uuid NOT NULL REFERENCES public.fma_attempts(id) ON DELETE CASCADE,
  question_id  text NOT NULL REFERENCES public.fma_questions(id) ON DELETE CASCADE,
  page_index   int  NOT NULL,
  -- Fractions of the page, 0..1 from the top-left. A question worked in two
  -- places (or across two sheets) gets a row each, so there is no unique key
  -- on (attempt, question).
  x            real NOT NULL CHECK (x >= 0 AND x <= 1),
  y            real NOT NULL CHECK (y >= 0 AND y <= 1),
  w            real NOT NULL CHECK (w > 0 AND w <= 1),
  h            real NOT NULL CHECK (h > 0 AND h <= 1),
  -- What the model saw: whether the question number was actually written next
  -- to the work, and anything it wants to flag about a doubtful call.
  labeled      boolean NOT NULL DEFAULT true,
  note         text,
  source       text NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fma_question_work_attempt_idx
  ON public.fma_question_work (attempt_id, question_id);

-- Splitter bookkeeping, mirroring the narrative agent's claim/error columns so
-- a page the model keeps choking on is retried a few times and then left alone
-- rather than re-read every ten minutes forever.
ALTER TABLE public.fma_attempts
  ADD COLUMN IF NOT EXISTS work_split_at       timestamptz,
  ADD COLUMN IF NOT EXISTS work_split_error    text,
  ADD COLUMN IF NOT EXISTS work_split_tries    int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS work_split_claimed_at timestamptz;

ALTER TABLE public.fma_scratch_pages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fma_question_work  ENABLE ROW LEVEL SECURITY;

-- Default privileges here hand service_role nothing useful on a new table, and
-- the splitter's writes would fail silently without this.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_scratch_pages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_question_work TO service_role;

-- The student uploads their own pages, so they insert and delete (replacing a
-- blurry photo) their own rows; everyone linked to the student can read them.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_scratch_pages TO authenticated;
DROP POLICY IF EXISTS "fma_scratch_pages: admin all" ON public.fma_scratch_pages;
CREATE POLICY "fma_scratch_pages: admin all" ON public.fma_scratch_pages
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_scratch_pages: linked all" ON public.fma_scratch_pages;
CREATE POLICY "fma_scratch_pages: linked all" ON public.fma_scratch_pages
  FOR ALL TO authenticated
  USING (attempt_id IN (SELECT id FROM public.fma_attempts WHERE student_id IN (SELECT public.my_student_ids())))
  WITH CHECK (attempt_id IN (SELECT id FROM public.fma_attempts WHERE student_id IN (SELECT public.my_student_ids())));

-- Boxes are written by the splitter (service_role) and only read in the app, so
-- students get SELECT and nothing else. Mark can correct one by hand.
GRANT SELECT ON public.fma_question_work TO authenticated;
DROP POLICY IF EXISTS "fma_question_work: admin all" ON public.fma_question_work;
CREATE POLICY "fma_question_work: admin all" ON public.fma_question_work
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fma_question_work: linked read" ON public.fma_question_work;
CREATE POLICY "fma_question_work: linked read" ON public.fma_question_work
  FOR SELECT TO authenticated
  USING (attempt_id IN (SELECT id FROM public.fma_attempts WHERE student_id IN (SELECT public.my_student_ids())));

-- The student may only write the two splitter-independent columns of
-- fma_attempts; the splitter's bookkeeping stays out of their reach the same
-- way `score` does (20260819150000 revoked UPDATE and re-granted one column).
GRANT UPDATE (scratch_work_url) ON public.fma_attempts TO authenticated;

COMMENT ON TABLE public.fma_scratch_pages IS
  'Pages of the single whole-test work scan a student uploads on the review screen.';
COMMENT ON TABLE public.fma_question_work IS
  'Normalized box on a scratch page holding one question''s work; written by scripts/fma-work-splitter.mjs.';
