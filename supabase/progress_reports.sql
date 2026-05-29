-- Task 2 + 3: progress reports
-- Stores uploaded progress-report PDFs and supports the reminder cadence.

create table if not exists public.progress_reports (
  id               uuid primary key default gen_random_uuid(),
  student_id       text not null references public.students(id) on delete cascade,
  title            text not null,
  pdf_url          text,
  sessions_covered int not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.progress_reports enable row level security;

grant all on public.progress_reports to service_role;

-- Students can read their own reports; admin (service key) bypasses RLS.
drop policy if exists "reports: student read" on public.progress_reports;
create policy "reports: student read" on public.progress_reports for select
  using (student_id in (select id from public.students where user_id = auth.uid()));

-- Reminder bookkeeping: last time Mark was nudged to write a report for a student.
-- Compared against the most recent report's created_at so it re-arms each cycle.
alter table public.students
  add column if not exists last_report_reminder_at timestamptz;

-- Public storage bucket for report PDFs (matches handout-pdfs pattern).
insert into storage.buckets (id, name, public)
  values ('progress-reports', 'progress-reports', true)
  on conflict (id) do nothing;
