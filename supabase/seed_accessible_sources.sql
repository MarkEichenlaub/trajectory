-- Seed initial accessible problem sources for students
-- Borna: IPhO, EuPhO, Balkan, NordicBaltic, USAPhO, Purcell
-- Leo: David Morin
-- India: none yet
-- Run after student_accessible_sources.sql migration

INSERT INTO public.student_accessible_sources (student_id, source) VALUES
  ('borna', 'IPhO'),
  ('borna', 'EuPhO'),
  ('borna', 'Balkan'),
  ('borna', 'NordicBaltic'),
  ('borna', 'USAPhO'),
  ('borna', 'Purcell'),
  ('leo',   'David Morin')
ON CONFLICT DO NOTHING;
