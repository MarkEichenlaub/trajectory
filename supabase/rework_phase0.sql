-- ============================================================================
-- Portal rework — Phase 0: accounts/roles schema, RLS, migration.
--
-- ADDITIVE and idempotent. The live student portal still uses the legacy
-- user_id-based RLS, so this migration ADDS new tables/columns/policies
-- alongside the old ones (Postgres OR-combines permissive policies). Legacy
-- policies and columns are dropped later in the cleanup phase, once the new
-- frontend has shipped.
-- ============================================================================

-- ── 1. New tables ──────────────────────────────────────────────────────────

-- One row per login (auth user). account_type decides billing visibility:
--   student → study only, no billing.  adult → study + billing (self-payer).
--   parent  → manages students + billing.  admin → everything (Mark).
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  account_type text not null default 'student'
               check (account_type in ('student', 'parent', 'adult', 'admin')),
  created_at   timestamptz not null default now()
);

-- Many-to-many: a parent links to several students; a student self-links;
-- multiple parents can link to one student.
create table if not exists public.student_links (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references auth.users(id) on delete cascade,
  student_id   text not null references public.students(id) on delete cascade,
  relationship text not null default 'self' check (relationship in ('self', 'parent')),
  created_at   timestamptz not null default now(),
  unique(account_id, student_id)
);
create index if not exists student_links_account_idx on public.student_links(account_id);
create index if not exists student_links_student_idx on public.student_links(student_id);

-- Admin- and parent-provisioned invites. Accepting one (via magic-link login,
-- which proves email ownership) creates the profile + link + verified contact.
create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,
  email        text not null,
  student_id   text not null references public.students(id) on delete cascade,
  relationship text not null default 'parent' check (relationship in ('self', 'parent')),
  account_type text not null default 'parent' check (account_type in ('student', 'parent', 'adult')),
  invited_by   uuid references auth.users(id) on delete set null,
  expires_at   timestamptz not null default (now() + interval '14 days'),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists invites_email_idx on public.invites(lower(email));

-- ── 2. Column additions ────────────────────────────────────────────────────

alter table public.students
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive'));

alter table public.student_contacts
  add column if not exists verified                  boolean not null default false,
  add column if not exists verification_token        text,
  add column if not exists verified_at               timestamptz,
  add column if not exists added_by_account_id       uuid references auth.users(id) on delete set null,
  add column if not exists bounced                   boolean not null default false,
  add column if not exists bounced_at                timestamptz,
  add column if not exists bounce_reason             text,
  add column if not exists receives_schedule_changes boolean not null default false;

-- ── 3. Capability helper functions (security definer → no RLS recursion) ─────

create or replace function public.my_student_ids()
returns setof text language sql stable security definer set search_path = public as $$
  select student_id from public.student_links where account_id = auth.uid()
$$;

-- Students this account may see billing for: parent links, or adult/admin type.
create or replace function public.my_billing_student_ids()
returns setof text language sql stable security definer set search_path = public as $$
  select sl.student_id
  from public.student_links sl
  left join public.profiles p on p.id = sl.account_id
  where sl.account_id = auth.uid()
    and (sl.relationship = 'parent' or p.account_type in ('adult', 'admin'))
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and account_type = 'admin')
$$;

grant execute on function public.my_student_ids()         to authenticated;
grant execute on function public.my_billing_student_ids() to authenticated;
grant execute on function public.is_admin()               to authenticated;

-- ── 4. New SELECT policies (OR-combined with legacy user_id policies) ────────

drop policy if exists "students: linked read" on public.students;
create policy "students: linked read" on public.students for select
  using (id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "assignments: linked read" on public.assignments;
create policy "assignments: linked read" on public.assignments for select
  using (student_id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "sessions: linked read" on public.sessions;
create policy "sessions: linked read" on public.sessions for select
  using (student_id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "study_plans: linked read" on public.study_plans;
create policy "study_plans: linked read" on public.study_plans for select
  using (student_id in (select public.my_student_ids()) or public.is_admin());

drop policy if exists "reports: linked read" on public.progress_reports;
create policy "reports: linked read" on public.progress_reports for select
  using (student_id in (select public.my_student_ids()) or public.is_admin());

-- Contacts: full-table read only for billing-capable accounts (parents/adults/
-- admin). Student-only accounts read contacts through get_my_contacts() (below),
-- which omits invoice fields — so invoice routing stays hidden from students.
drop policy if exists "contacts: billing read" on public.student_contacts;
create policy "contacts: billing read" on public.student_contacts for select
  using (student_id in (select public.my_billing_student_ids()) or public.is_admin());

-- Invoices: billing-capable only. Students get no invoice read under the new model.
drop policy if exists "invoices: billing read" on public.invoices;
create policy "invoices: billing read" on public.invoices for select
  using (student_id in (select public.my_billing_student_ids()) or public.is_admin());

-- ── 5. RLS on the new tables ────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.student_links enable row level security;
alter table public.invites       enable row level security;

grant select on public.profiles      to authenticated;
grant select on public.student_links to authenticated;
grant select on public.invites       to authenticated;
grant all    on public.profiles      to service_role;
grant all    on public.student_links to service_role;
grant all    on public.invites       to service_role;

drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "links: self read" on public.student_links;
create policy "links: self read" on public.student_links for select
  using (account_id = auth.uid() or public.is_admin());

-- An invite is visible to the invitee (matched by their auth email, before any
-- profile exists), to whoever created it, and to admin.
drop policy if exists "invites: invitee or owner read" on public.invites;
create policy "invites: invitee or owner read" on public.invites for select
  using (lower(email) = lower(auth.email()) or invited_by = auth.uid() or public.is_admin());

-- ── 6. Student-facing contact read (invoice fields omitted) ──────────────────

create or replace function public.get_my_contacts(p_student_id text)
returns table (
  id uuid, student_id text, email text, label text,
  receives_meets boolean, receives_reports boolean, receives_assignments boolean,
  receives_schedule_changes boolean, verified boolean, bounced boolean, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.id, c.student_id, c.email, c.label,
         c.receives_meets, c.receives_reports, c.receives_assignments,
         c.receives_schedule_changes, c.verified, c.bounced, c.created_at
  from public.student_contacts c
  where c.student_id = p_student_id
    and c.student_id in (select public.my_student_ids())
  order by c.created_at
$$;
grant execute on function public.get_my_contacts(text) to authenticated;

-- ── 7. Active/inactive toggle (billing-capable or admin only) ────────────────

create or replace function public.set_student_status(p_student_id text, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('active', 'inactive') then
    raise exception 'invalid status %', p_status;
  end if;
  if not (public.is_admin() or p_student_id in (select public.my_billing_student_ids())) then
    raise exception 'not authorized to change status for %', p_student_id;
  end if;
  update public.students set status = p_status where id = p_student_id;
end;
$$;
grant execute on function public.set_student_status(text, text) to authenticated;

-- ── 8. Migration / backfill ──────────────────────────────────────────────────

-- 8a. Profiles + self-links for students who have already logged in (user_id set).
insert into public.profiles (id, email, account_type)
select s.user_id, u.email, 'student'
from public.students s
join auth.users u on u.id = s.user_id
where s.user_id is not null
on conflict (id) do nothing;

insert into public.student_links (account_id, student_id, relationship)
select s.user_id, s.id, 'self'
from public.students s
where s.user_id is not null
on conflict (account_id, student_id) do nothing;

-- 8b. Mark = admin.
insert into public.profiles (id, email, account_type)
select u.id, u.email, 'admin'
from auth.users u
where lower(u.email) = 'mark.d.eichenlaub@gmail.com'
on conflict (id) do update set account_type = 'admin';

-- 8c. Grandfather all existing contacts as verified so current notifications
--     keep working, and let parent contacts receive schedule-change notices.
update public.student_contacts
set verified = true, verified_at = coalesce(verified_at, now())
where verified = false;

update public.student_contacts
set receives_schedule_changes = true
where label = 'parent' and receives_schedule_changes = false;

-- 8d. Everyone currently in the system is active.
update public.students set status = 'active' where status is null;
