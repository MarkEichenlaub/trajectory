-- Google delivers a calendar push notification more than once. Testing the
-- vanished-session alert produced seven identical webhook runs within 700ms —
-- seven log rows and seven emails for one deletion. An alert that arrives seven
-- times is an alert Mark filters, which defeats the point.
--
-- The unique key doubles as the send-once latch: gcal-webhook inserts with
-- ON CONFLICT DO NOTHING and only emails when the insert actually created the
-- row, so whichever duplicate invocation wins the race sends exactly one email.
--
-- Scoped to the event id plus the UTC date, not the event id alone, so an event
-- genuinely cancelled again on a later day is still recorded and still alerts.
-- Left null by the deletion trigger: nulls don't collide in a unique index, so
-- repeated session_row_deleted entries for the same event are all preserved.
alter table public.session_deletions
  add column if not exists dedupe_key text;

create unique index if not exists session_deletions_dedupe_key_idx
  on public.session_deletions (dedupe_key);
