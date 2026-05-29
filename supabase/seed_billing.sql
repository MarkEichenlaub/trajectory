update public.students set session_balance = 5, hourly_rate = 300 where id = 'leo';
update public.students set session_balance = 0, hourly_rate = 200 where id = 'borna';
update public.students set session_balance = 0, hourly_rate = 300 where lower(name) like '%india%';
