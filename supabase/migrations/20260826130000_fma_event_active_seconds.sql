-- Per-question times were still wall-clock, even though the attempt total
-- stopped being wall-clock in 20260825130000_fma_active_seconds.sql.
--
-- The review page derives "time spent on question N" from the gap between
-- consecutive rows in fma_answer_events, measured with clicked_at. That gap
-- includes every stretch the student was NOT taking the test: a save-and-exit,
-- a switch to another tab, a closed laptop. Whichever question happened to be
-- on screen when they stepped away absorbed the whole absence.
--
-- Caught on a QA sitting whose honest working time was 2 minutes: question 1
-- was credited with 10m 23s, and the per-question times summed to ~16 minutes.
-- The same screen showed "2 min working time" a few hundred pixels above, so
-- the two numbers openly contradicted each other.
--
-- Fix: stamp each event with the exam clock's reading -- the runner's banked
-- active seconds at the instant of the event -- and take per-question spans as
-- differences of those stamps. The clock already pauses correctly, so this
-- inherits the pausing for free rather than reimplementing it, and no
-- pause/resume bookkeeping has to be kept consistent with it.
--
-- Nullable on purpose: rows written before this migration have no stamp, and
-- readers fall back to the old wall-clock arithmetic for those attempts so
-- historical sittings keep rendering.

ALTER TABLE public.fma_answer_events
  ADD COLUMN IF NOT EXISTS active_seconds int;

-- Same bound as fma_attempts.active_seconds, and non-negative: this is a
-- position on the exam clock, not a duration between events.
ALTER TABLE public.fma_answer_events DROP CONSTRAINT IF EXISTS fma_answer_events_active_seconds_range;
ALTER TABLE public.fma_answer_events ADD CONSTRAINT fma_answer_events_active_seconds_range
  CHECK (active_seconds IS NULL OR (active_seconds >= 0 AND active_seconds <= 86400));
