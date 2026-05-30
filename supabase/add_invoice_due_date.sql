alter table public.invoices
  add column if not exists due_date timestamptz;
