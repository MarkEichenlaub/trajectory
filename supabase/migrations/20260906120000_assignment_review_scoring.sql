-- The AI review email/panel now leads with a raw score and a color-coded
-- per-question table, and links straight to the assigned pages. The score and
-- the source-page pointer are first-class columns (the per-question rows keep
-- living in question_breakdown, which gained student_answer / correct_answer /
-- status / detail keys -- jsonb, so no migration needed for those).

ALTER TABLE public.assignment_reviews
  ADD COLUMN IF NOT EXISTS score_correct integer,
  ADD COLUMN IF NOT EXISTS score_total   integer,
  ADD COLUMN IF NOT EXISTS source_page   integer,
  ADD COLUMN IF NOT EXISTS source_label  text;
