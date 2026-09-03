-- Adds the "unit simplification & dimensional analysis" fluency skill
-- (see src/fluency/generators.js: genUnitDimensions) and enables it for
-- Leo and the test student, same as the initial skill set.

INSERT INTO public.fluency_skills (id, generator_key, name, description, category) VALUES
  ('unit-dimensions', 'unit-dimensions', 'Unit simplification & dimensional analysis',
   'Simplifying fractions of kg/m/s, recalling derived units (N, J, Pa, W), and reading a constant''s units off a formula.', 'units')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'leo', 'unit-dimensions'
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'leo')
ON CONFLICT (student_id, skill_id) DO NOTHING;

INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'test-student', 'unit-dimensions'
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'test-student')
ON CONFLICT (student_id, skill_id) DO NOTHING;
