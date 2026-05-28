-- student_contacts table
-- Run in Supabase SQL Editor after sessions.sql

create table if not exists public.student_contacts (
  id            uuid primary key default gen_random_uuid(),
  student_id    text not null references public.students(id) on delete cascade,
  email         text not null,
  label         text not null default 'student',  -- 'student', 'parent', etc.
  receives_meets boolean not null default true,
  can_login     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique(student_id, email)
);

alter table public.student_contacts enable row level security;

grant all on public.student_contacts to service_role;
grant select on public.student_contacts to authenticated;

create policy "contacts: self read"
  on public.student_contacts for select
  using (
    student_id in (
      select id from public.students where user_id = auth.uid()
    )
  );

-- Migrate existing primary emails from students table
insert into public.student_contacts (student_id, email, label, receives_meets, can_login)
select id, email, 'student', true, true
from public.students
where email is not null and trim(email) <> ''
on conflict (student_id, email) do nothing;

-- Update link_student_account to resolve login via student_contacts
create or replace function public.link_student_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_email     text := auth.email();
  v_student_id text;
begin
  select sc.student_id into v_student_id
  from public.student_contacts sc
  where lower(sc.email) = lower(v_email)
    and sc.can_login = true
  limit 1;

  -- Fallback: legacy students.email column
  if v_student_id is null then
    select id into v_student_id
    from public.students
    where lower(email) = lower(v_email)
    limit 1;
  end if;

  if v_student_id is not null then
    update public.students set user_id = v_user_id where id = v_student_id;
  end if;
end;
$$;
