alter table public.assignments
  add column if not exists requires_submission boolean not null default true;
