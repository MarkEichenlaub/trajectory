-- Grant Leo access to the F=ma exam bank
INSERT INTO public.student_accessible_sources (student_id, source)
VALUES ('leo', 'F=ma')
ON CONFLICT DO NOTHING;
