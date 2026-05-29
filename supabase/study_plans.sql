create table public.study_plans (
  id           uuid        primary key default gen_random_uuid(),
  student_id   text        not null references public.students(id) on delete cascade,
  content      text        not null default '',
  status       text        not null default 'active'
                           check (status in ('active', 'pending_approval', 'archived')),
  proposed_by  text        not null default 'admin'
                           check (proposed_by in ('admin', 'student')),
  created_at   timestamptz not null default now()
);

alter table public.study_plans enable row level security;

-- Students can read their own plans
create policy "study_plans: student read" on public.study_plans for select
  using (student_id in (select id from public.students where user_id = auth.uid()));

-- Students can insert pending proposals only
create policy "study_plans: student propose" on public.study_plans for insert
  with check (
    student_id in (select id from public.students where user_id = auth.uid())
    and status = 'pending_approval'
    and proposed_by = 'student'
  );

grant select, insert, update, delete on public.study_plans to anon;
grant select, insert, update, delete on public.study_plans to authenticated;
grant select, insert, update, delete on public.study_plans to service_role;
