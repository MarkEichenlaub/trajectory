INSERT INTO public.invoices (student_id, amount_cents, sessions_count, status, created_at, due_date)
VALUES
  -- Silvio Savarese / Leo: Wave Invoice #1, 10 sessions @ $300, paid Apr 3 2026
  ('leo',    300000, 10, 'paid', '2026-04-03T19:00:00Z', '2026-04-03T19:00:00Z'),

  -- Ana Curkovic / Borna: PayPal payments (gross amounts back-calculated from net; fee = 4.99% + $0.49)
  ('borna',   20000,  1, 'paid', '2026-03-10T12:00:00Z', '2026-03-10T12:00:00Z'),
  ('borna',  160000,  8, 'paid', '2026-03-12T12:00:00Z', '2026-03-12T12:00:00Z'),
  ('borna',   20000,  1, 'paid', '2026-04-06T12:00:00Z', '2026-04-06T12:00:00Z'),
  ('borna',   60000,  3, 'paid', '2026-04-10T12:00:00Z', '2026-04-10T12:00:00Z'),
  ('borna',   40000,  2, 'paid', '2026-04-18T12:00:00Z', '2026-04-18T12:00:00Z'),
  ('borna',   40000,  2, 'paid', '2026-04-26T12:00:00Z', '2026-04-26T12:00:00Z'),
  ('borna',   20000,  1, 'paid', '2026-05-03T12:00:00Z', '2026-05-03T12:00:00Z'),
  ('borna',   40000,  2, 'paid', '2026-05-11T12:00:00Z', '2026-05-11T12:00:00Z'),
  ('borna',   40000,  2, 'paid', '2026-05-24T12:00:00Z', '2026-05-24T12:00:00Z'),
  ('borna',   40000,  2, 'paid', '2026-05-26T12:00:00Z', '2026-05-26T12:00:00Z');
