-- Add receives_reports and receives_invoices columns
alter table public.student_contacts
  add column if not exists receives_reports  boolean not null default true,
  add column if not exists receives_invoices boolean not null default false;

-- Allow students to manage their own contacts from the portal
create policy "contacts: self insert"
  on public.student_contacts for insert
  with check (
    student_id in (select id from public.students where user_id = auth.uid())
  );

create policy "contacts: self update"
  on public.student_contacts for update
  using (student_id in (select id from public.students where user_id = auth.uid()));

create policy "contacts: self delete"
  on public.student_contacts for delete
  using (student_id in (select id from public.students where user_id = auth.uid()));
