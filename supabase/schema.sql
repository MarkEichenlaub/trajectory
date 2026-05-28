-- ============================================================
-- Trajectory schema
-- Run this in Supabase SQL Editor once
-- Problems stay in GitHub JSON; only students + assignments here
-- ============================================================

create table public.students (
  id         text primary key,
  name       text not null,
  email      text,
  notes      text default '',
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.students enable row level security;

create table public.assignments (
  id             text primary key,
  student_id     text not null references public.students(id) on delete cascade,
  problem_id     text not null,
  status         text not null check (status in ('assigned', 'completed')),
  assigned_date  date,
  completed_date date,
  created_at     timestamptz default now()
);

alter table public.assignments enable row level security;

-- Students can read their own row
create policy "students: self read"
  on public.students for select
  using (auth.uid() = user_id);

-- Students can read their own assignments (once user_id is linked)
create policy "assignments: self read"
  on public.assignments for select
  using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- Function to link a logged-in user to their student record by email
-- Called client-side after first login
create or replace function public.link_student_account()
returns void
language sql
security definer
set search_path = public
as $$
  update students
  set user_id = auth.uid()
  where lower(email) = lower((select email from auth.users where id = auth.uid()))
    and user_id is null;
$$;

grant execute on function public.link_student_account() to authenticated;
