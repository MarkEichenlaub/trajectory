-- Two skills from Leo's 2026-09-17 session (the spool torque problem).
--
-- He wrote down the right system -- T cos θ - f = 0 and 2f - T = 0 -- and then
-- spent several minutes adding and re-arranging the two equations before Mark
-- pointed at substitution. Mark, in the session: "The system of equations is
-- something that kind of needs to be second nature. And so we'll practice more
-- with the system of equations."
--
-- Then, with cos θ = 1/2 in front of him: "30 degrees. No, I lied. 60 degrees."
-- Hence the 30°-step trig table, drilled in both directions.
--
-- Generators live in src/fluency/generators.js (genLinearSystems,
-- genSpecialAngles).

INSERT INTO public.fluency_skills (id, generator_key, name, description, category) VALUES
  ('special-angles', 'special-angles', 'Special angles: sin, cos, tan from 0° to 180°',
   'The 30°-step table both ways -- read off sin/cos/tan of 0, 30, 60, 90, 120, 150 and 180 degrees, and go backwards from a value to the angle (arccos(1/2) = 60°).',
   'trigonometry'),
  ('linear-systems', 'linear-systems', 'Two-equation systems (force + torque)',
   'Solving the small systems an F=ma problem actually produces -- substitute, add to eliminate, and divide out the symbol that cancels (T cos θ = f with 2f = T).',
   'algebra')
ON CONFLICT (id) DO NOTHING;

-- ── Turn them on for Leo ────────────────────────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'leo', id FROM public.fluency_skills
WHERE id IN ('special-angles', 'linear-systems')
  AND EXISTS (SELECT 1 FROM public.students WHERE id = 'leo')
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- ── Same for the persistent test student, for QA (matches the convention
-- set in the earlier fluency migrations). ──────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'test-student', id FROM public.fluency_skills
WHERE id IN ('special-angles', 'linear-systems')
  AND EXISTS (SELECT 1 FROM public.students WHERE id = 'test-student')
ON CONFLICT (student_id, skill_id) DO NOTHING;
