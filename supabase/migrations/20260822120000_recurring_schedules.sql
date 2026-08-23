-- General recurring-session scheduling: one weekly pattern per student,
-- editable from the admin Schedule tab (students cannot set this themselves).
-- setup-recurring-schedule turns a row here into a Google Calendar RRULE
-- series; sync-recurring-sessions expands that series into `sessions` rows,
-- the same way the Leo/Borna-specific functions already do.

create table public.recurring_schedules (
  student_id        text primary key references public.students(id) on delete cascade,
  days_of_week      text[] not null,        -- iCal BYDAY codes, e.g. {MO,TU,WE,TH,FR}
  start_time        time not null,          -- local wall-clock time, e.g. 10:00
  duration_minutes  int not null default 60,
  timezone          text not null default 'America/New_York',
  calendar_summary  text not null,          -- e.g. "Akshatha / Mark Physics"; used to find/replace the GCal series
  start_date        date not null,
  end_date          date,                   -- null = open-ended
  gcal_event_id     text,                   -- base recurring event id, set after creation
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.recurring_schedules enable row level security;

create policy "recurring_schedules: admin all" on public.recurring_schedules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant all on public.recurring_schedules to service_role;
