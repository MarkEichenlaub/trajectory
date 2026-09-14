-- AI narrative for a finished F=ma practice exam: what the student has learned,
-- what they fixed since last time, what still needs work, patterns in the wrong
-- answers, and a per-question read on each miss.
--
-- Written by scripts/fma-narrative-agent.mjs, which runs on Mark's machine so
-- the analysis goes through his Claude subscription rather than the API. The
-- notify-fma-attempt edge function can't do this itself: it has no shell, and
-- the narrative needs the student's whole history (earlier attempts, graded
-- homework, session transcripts), not just the attempt that triggered it.
--
-- Admin-only, like assignment_reviews -- the student never sees it. One row per
-- attempt, upserted by attempt_id, so a re-run replaces rather than accumulates.

CREATE TABLE IF NOT EXISTS public.fma_attempt_narratives (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id         uuid NOT NULL UNIQUE REFERENCES public.fma_attempts(id) ON DELETE CASCADE,
  student_id         text REFERENCES public.students(id) ON DELETE SET NULL,
  exam_id            text,
  -- The narrative sections, each a paragraph or two of prose.
  learned            text,   -- things they've clearly picked up
  improved           text,   -- things we worked on that landed this time
  needs_work         text,   -- what to go after next
  wrong_answer_trend text,   -- patterns across the misses, including timing
  what_helped        text,   -- what this exam says about what's working
  headline           text,   -- one or two sentences up top
  -- One entry per missed question:
  -- {question_num, topics, what_it_asks, their_answer, correct_answer,
  --  likely_reasoning, verdict, work_seen}
  misses             jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- False when the student uploaded no scan, so the per-question reasoning is
  -- inferred from the distractor they picked rather than read off their paper.
  work_uploaded      boolean NOT NULL DEFAULT false,
  sources            jsonb NOT NULL DEFAULT '{}'::jsonb,  -- what the model was given
  model              text,
  generated_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fma_attempt_narratives_student_idx
  ON public.fma_attempt_narratives (student_id, generated_at DESC);

ALTER TABLE public.fma_attempt_narratives ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.fma_attempt_narratives TO service_role;

DROP POLICY IF EXISTS "fma_attempt_narratives: admin all" ON public.fma_attempt_narratives;
CREATE POLICY "fma_attempt_narratives: admin all" ON public.fma_attempt_narratives
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.set_fma_attempt_narratives_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fma_attempt_narratives_updated_at ON public.fma_attempt_narratives;

CREATE TRIGGER trg_fma_attempt_narratives_updated_at
  BEFORE UPDATE ON public.fma_attempt_narratives
  FOR EACH ROW EXECUTE FUNCTION public.set_fma_attempt_narratives_updated_at();
