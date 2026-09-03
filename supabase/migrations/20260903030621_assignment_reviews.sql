-- AI-generated first-pass review of a non-F=ma homework submission: a summary,
-- a per-question breakdown, and flagged issues, plus Mark's own notes on top.
-- Admin-only (never exposed to the student). One row per assignment — the
-- grading agent (scripts/grade-submission-agent.mjs) upserts by assignment_id
-- rather than accumulating history, matching how assignment_submissions /
-- assignments are already treated as current-state, not a log.

CREATE TABLE IF NOT EXISTS public.assignment_reviews (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id      text NOT NULL UNIQUE REFERENCES public.assignments(id) ON DELETE CASCADE,
  ai_summary         text,
  question_breakdown jsonb,
  issues             jsonb,
  mark_notes         text,
  graded_at          timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignment_reviews ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.assignment_reviews TO service_role;

DROP POLICY IF EXISTS "assignment_reviews: admin all" ON public.assignment_reviews;
CREATE POLICY "assignment_reviews: admin all" ON public.assignment_reviews FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.set_assignment_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assignment_reviews_updated_at ON public.assignment_reviews;

CREATE TRIGGER trg_assignment_reviews_updated_at
  BEFORE UPDATE ON public.assignment_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_assignment_reviews_updated_at();
