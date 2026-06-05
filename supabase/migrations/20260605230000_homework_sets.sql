-- ============================================================================
-- Homework sets: an admin-curated, ordered bundle of AoPS problems compiled
-- into a single PDF for a student (see scripts/build_homework_set.py in the
-- EigenNode repo). The portal creates the row (status='draft'); the local build
-- script fills pdf_url and flips status to 'built'. The student sees ONE
-- downloadable item per set.
-- ============================================================================

create table if not exists public.homework_sets (
  id            text primary key,
  student_id    text references public.students(id),
  title         text,
  lesson        text,
  problem_ids   text[] not null default '{}',   -- ordered EigenNode node UUIDs
  assigned_date date,
  due_date      date,
  pdf_url       text,
  status        text not null default 'draft',   -- draft → built → sent
  created_at    timestamptz not null default now()
);

alter table public.homework_sets enable row level security;

grant select, insert, update, delete on public.homework_sets to authenticated;

-- Admin: full CRUD (mirrors "assignments: admin all").
drop policy if exists "homework_sets: admin all" on public.homework_sets;
create policy "homework_sets: admin all" on public.homework_sets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Student / parent: read their own sets (mirrors "accessible_sources: linked read").
drop policy if exists "homework_sets: linked read" on public.homework_sets;
create policy "homework_sets: linked read" on public.homework_sets for select to authenticated
  using (student_id in (select public.my_student_ids()));

-- Public bucket for the compiled PDFs (reads served by URL, like handout-pdfs).
insert into storage.buckets (id, name, public)
values ('homework-sets', 'homework-sets', true)
on conflict (id) do nothing;

drop policy if exists "homework-sets: admin write" on storage.objects;
create policy "homework-sets: admin write" on storage.objects for all to authenticated
  using (bucket_id = 'homework-sets' and public.is_admin())
  with check (bucket_id = 'homework-sets' and public.is_admin());
