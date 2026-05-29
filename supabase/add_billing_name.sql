alter table public.students add column if not exists billing_name text;

update public.students set billing_name = 'Ana Curic'        where id = 'borna';
update public.students set billing_name = 'Silvio Savarese'  where id = 'leo';
update public.students set billing_name = 'Thomas Ewald'     where lower(name) like '%india%';
