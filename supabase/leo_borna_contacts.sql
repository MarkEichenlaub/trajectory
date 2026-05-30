update public.students set email = 'leo.lisavarese1@gmail.com' where id = 'leo';

insert into public.student_contacts (student_id, email, label, receives_meets, receives_reports, receives_invoices, can_login)
values
  ('leo', 'leo.lisavarese1@gmail.com',  'student', true,  true,  false, true),
  ('leo', 'leolisa@nuevaschool.org',    'student', false, false, false, true),
  ('leo', 'harinis@stanford.edu',       'parent',  true,  true,  false, false),
  ('leo', 'feifeili@cs.stanford.edu',   'parent',  false, true,  false, false),
  ('leo', 'silvio.savarese@gmail.com',  'parent',  true,  true,  true,  false)
on conflict (student_id, email) do update set
  label             = excluded.label,
  receives_meets    = excluded.receives_meets,
  receives_reports  = excluded.receives_reports,
  receives_invoices = excluded.receives_invoices,
  can_login         = excluded.can_login;

insert into public.student_contacts (student_id, email, label, receives_meets, receives_reports, receives_invoices, can_login)
values ('borna', 'ana.curkovic@cjb.hr', 'parent', false, true, true, true)
on conflict (student_id, email) do update set
  label             = excluded.label,
  receives_reports  = excluded.receives_reports,
  receives_invoices = excluded.receives_invoices,
  can_login         = excluded.can_login;
