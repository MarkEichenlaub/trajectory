INSERT INTO public.sessions (id, student_id, scheduled_at, end_time, summary, notes, balance_decremented, cal_booking_id)
VALUES (
  gen_random_uuid()::text,
  'india',
  '2026-06-02T19:30:00Z',
  '2026-06-02T20:00:00Z',
  '30-min intro meeting',
  'Introductory session — not billed.',
  false,
  'fdGE6LJBeJonzRG42jtd2F'
);
