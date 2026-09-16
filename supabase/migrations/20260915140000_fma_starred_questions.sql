-- "Star" a question during a practice test.
--
-- Distinct from `flagged`, which is the in-test "come back to this before I
-- submit" marker and gets cleared as the student works through their list. A
-- star means "I was unsure and guessed -- remind me to look at this again",
-- and it is meant to survive into the results page and the report email. A
-- student who guesses right by accident otherwise has nothing telling them the
-- question is still worth going over together.
--
-- Same home as flagged/eliminated_choices: fma_attempt_answers, keyed by
-- (attempt_id, question_id), and a row may carry a star with selected_choice
-- still NULL (starred, then skipped).

ALTER TABLE public.fma_attempt_answers
  ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;
