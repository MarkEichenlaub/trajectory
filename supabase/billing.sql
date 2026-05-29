-- Billing fields on students
alter table public.students
  add column if not exists session_balance int not null default 0,
  add column if not exists hourly_rate numeric(10,2) not null default 0,
  add column if not exists stripe_customer_id text;

-- Track whether a completed session has been billed
alter table public.sessions
  add column if not exists balance_decremented boolean not null default false;

-- Invoice history
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(id) on delete cascade,
  stripe_invoice_id text,
  stripe_invoice_url text,
  amount_cents int not null,
  sessions_count int not null default 10,
  status text not null default 'sent' check (status in ('sent', 'paid', 'void')),
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "invoices: student read" on public.invoices for select
  using (student_id in (select id from public.students where user_id = auth.uid()));
