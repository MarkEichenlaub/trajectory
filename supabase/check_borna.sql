select id, name, session_balance, hourly_rate, stripe_customer_id from students where id = 'borna';
select email from student_contacts where student_id = 'borna' and receives_invoices = true limit 1;
