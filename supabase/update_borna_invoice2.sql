delete from public.invoices where student_id = 'borna';
insert into public.invoices (student_id, stripe_invoice_id, stripe_invoice_url, amount_cents, sessions_count, status)
values ('borna', 'in_1TcQku6YJ60IfejIj0LxpLrE', 'https://dashboard.stripe.com/invoices/in_1TcQku6YJ60IfejIj0LxpLrE', 200000, 10, 'sent');
