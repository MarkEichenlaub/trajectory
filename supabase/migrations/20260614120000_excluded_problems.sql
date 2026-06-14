-- Admin-only table for problems permanently hidden from the portal.
-- Mark clicks "Delete" in the preview modal; the ID lands here and the
-- problem disappears from the browser without touching the source JSON.

create table if not exists public.excluded_problems (
  problem_id text primary key,
  excluded_at timestamptz not null default now()
);

alter table public.excluded_problems enable row level security;

-- Only the admin may read or write.
create policy "excluded_problems: admin all"
  on public.excluded_problems for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
