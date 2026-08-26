-- Invoice due dates: make Stripe the source of truth, and notice when one lapses.
--
-- Two separate due dates existed and never agreed. Stripe set the real one from
-- `days_until_due: 7` at finalization — that is the date printed on the invoice
-- the customer receives. The portal then overwrote the local column with
-- "today + 30 days" the moment the send button was pressed, a number with no
-- basis in anything. Leo's August invoice therefore read "due Sept 18" in the
-- admin Billing tab while the customer's copy said "due Aug 26", so the existing
-- overdue badge would not have lit up until 23 days after the fact.
--
-- The frontend no longer writes this column; bill-sessions now copies the value
-- back from Stripe on its regular pass, which also self-heals rows written under
-- the old behavior.

-- Tracks the last time Mark was told an invoice is past due, so the 5-minute
-- cron nags once and then weekly rather than every single run.
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS overdue_notified_at timestamptz;

COMMENT ON COLUMN public.invoices.due_date IS
  'Mirror of the Stripe invoice due_date, refreshed by bill-sessions. Do not set this from the client — Stripe decides it via days_until_due at finalization.';
