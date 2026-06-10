-- Homework-packet drafts live on the handouts table: a draft is just a handout
-- row whose status isn't 'active' yet. Lifecycle:
--   requested -> building -> draft <-> revise -> active   (+ failed)
-- The build request (student, problem ids, lesson, instructions) rides along in
-- `request`; revision feedback in `review_notes`. Run in the Supabase SQL editor.

alter table public.handouts
  add column if not exists status text not null default 'active',
  add column if not exists request jsonb,
  add column if not exists review_notes text not null default '';

alter table public.handouts drop constraint if exists handouts_status_check;
alter table public.handouts add constraint handouts_status_check
  check (status in ('requested', 'building', 'draft', 'revise', 'active', 'failed'));

-- Students may only see active handouts. The admin keeps full visibility through
-- the existing "handouts: admin all" policy (policies OR together), and the
-- build agent uses the service role, which bypasses RLS.
drop policy if exists "handouts: authenticated read" on public.handouts;
create policy "handouts: authenticated read"
  on public.handouts for select
  to authenticated
  using (status = 'active');
