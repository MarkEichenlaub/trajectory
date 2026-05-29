update public.students set stripe_customer_id = 'cus_UbcJzlWT1f0LaH' where id = 'borna';

insert into public.invoices (student_id, stripe_invoice_id, stripe_invoice_url, amount_cents, sessions_count, status)
values ('borna', 'in_1TcP5V6YJ60IfejIshXH14Lc', 'https://dashboard.stripe.com/invoices/in_1TcP5V6YJ60IfejIshXH14Lc', 200000, 10, 'draft');
