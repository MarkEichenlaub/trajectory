-- Track which sessions have been included in a Venmo billing reminder email.
-- Prevents duplicate emails if the cron runs while balance is still at 0.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS venmo_invoiced boolean NOT NULL DEFAULT false;
