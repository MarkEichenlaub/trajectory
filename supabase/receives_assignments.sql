alter table public.student_contacts
  add column if not exists receives_assignments boolean not null default true;
