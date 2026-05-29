-- Backfill end_time for legacy sessions imported before the portal existed.
-- These were brought in from calendar/Ziteboard history and never had an
-- end_time; assume a 1-hour duration so the completed-session logic
-- (bill-sessions reminders, report drafting) counts them.
update public.sessions
set end_time = scheduled_at + interval '1 hour'
where end_time is null;
