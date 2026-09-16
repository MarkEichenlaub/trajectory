-- A free session needs a way to say so. Akshatha's 30-minute trial was recorded
-- as an ordinary session and flagged balance_decremented, so it read as though
-- it had eaten half an hour of the block her father paid for. There was no flag
-- for "this one is on the house" — session_type only distinguishes a tutoring
-- session from a parent check-in, and `paid` is a separate manual admin toggle
-- about whether money arrived, not about whether the session costs credit.
--
-- Default true, so every existing and future session bills as it does today;
-- only a row explicitly set false is free.
alter table public.sessions
  add column if not exists billable boolean not null default true;

comment on column public.sessions.billable is
  'False for a session that costs the family nothing (a trial, a make-good). '
  'bill-sessions skips these entirely, and the progress report shows them as '
  'free and leaves them out of the billed total.';

-- Akshatha's trial, 2026-08-21. It was already marked balance_decremented, so
-- nothing will re-bill it; this records why it must never be billed.
update public.sessions
   set billable = false
 where id = 'trial-akshatha-20260821';
