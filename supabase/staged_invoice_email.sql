-- Task 1: staged invoice email
-- bill-sessions composes the billing-contact email when an invoice is drafted;
-- admin reviews and sends it from the portal Account tab.
alter table public.invoices
  add column if not exists staged_email_to      text,
  add column if not exists staged_email_subject text,
  add column if not exists staged_email_body    text;
