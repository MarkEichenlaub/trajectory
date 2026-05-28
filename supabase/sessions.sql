-- Sessions table
-- Run in Supabase SQL Editor after schema.sql

create table public.sessions (
  id             text primary key,
  student_id     text not null references public.students(id) on delete cascade,
  scheduled_at   timestamptz not null,
  notes          text default '',
  miro_board_id  text,
  miro_board_url text,
  cal_booking_id text,
  created_at     timestamptz default now()
);

alter table public.sessions enable row level security;

-- Students can read their own sessions
create policy "sessions: self read"
  on public.sessions for select
  using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

grant all on public.sessions to service_role;
grant select on public.sessions to authenticated;
