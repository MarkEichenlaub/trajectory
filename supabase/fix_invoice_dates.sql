-- Fix the 3 estimated dates that were off, and insert the missing Mar 29 invoice
UPDATE public.invoices SET created_at = '2026-04-20T12:00:00Z', due_date = '2026-04-20T12:00:00Z'
  WHERE student_id = 'borna' AND created_at = '2026-04-18T12:00:00Z';

UPDATE public.invoices SET created_at = '2026-05-04T12:00:00Z', due_date = '2026-05-04T12:00:00Z'
  WHERE student_id = 'borna' AND created_at = '2026-05-03T12:00:00Z';

UPDATE public.invoices SET created_at = '2026-05-28T12:00:00Z', due_date = '2026-05-28T12:00:00Z'
  WHERE student_id = 'borna' AND created_at = '2026-05-26T12:00:00Z';

INSERT INTO public.invoices (student_id, amount_cents, sessions_count, status, created_at, due_date)
VALUES ('borna', 40000, 2, 'paid', '2026-03-29T12:00:00Z', '2026-03-29T12:00:00Z');
