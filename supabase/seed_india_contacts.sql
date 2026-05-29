insert into public.student_contacts (student_id, email, label, receives_meets, receives_reports, receives_invoices, receives_assignments, can_login)
values
  ('india', 'ewald.kathy@gmail.com',    'parent', true, true, false, false, false),
  ('india', 'thomashbewald@gmail.com',  'parent', true, true, true,  false, false)
on conflict (student_id, email) do nothing;
