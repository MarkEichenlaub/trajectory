-- Bring the practice runner closer to the real F=ma sitting, which is now
-- administered online through Educational Vistas. Their platform lets a student
-- mark distractor choices, flag a question, and come back to anything left
-- incomplete, so both bits of state have to survive leaving and resuming.
--
-- Both live on fma_attempt_answers, keyed by (attempt_id, question_id). A row
-- may now exist with selected_choice NULL -- flagged or with crossed-out options
-- but not yet answered -- which grading already handles: submit_fma_attempt()
-- marks such a row is_correct = false and the score counts only true.

ALTER TABLE public.fma_attempt_answers
  ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;

ALTER TABLE public.fma_attempt_answers
  ADD COLUMN IF NOT EXISTS eliminated_choices TEXT[] DEFAULT '{}';

-- Crossing out an option is only meaningful for A-E.
ALTER TABLE public.fma_attempt_answers DROP CONSTRAINT IF EXISTS fma_answers_eliminated_chk;
ALTER TABLE public.fma_attempt_answers ADD CONSTRAINT fma_answers_eliminated_chk
  CHECK (eliminated_choices <@ ARRAY['A','B','C','D','E']::text[]);
