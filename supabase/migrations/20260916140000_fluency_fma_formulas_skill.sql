-- Adds the "F=ma formulas" fluency skill (Mark's request, 2026-09-16: "just a
-- list of common F = ma formulas ... the acceleration in a circular orbit in
-- terms of v and r, or in terms of omega and r").
--
-- The card list was harvested from the worked solutions of the 22 real F=ma
-- papers digitized in scripts/fma_exams/ (2010-2023 plus the four PhysicsWOOT
-- practice exams), then cut down by Mark by hand -- the obvious ones (F = ma,
-- v = d/t) are deliberately out. Content lives in src/fluency/fmaFormulaData.js.

INSERT INTO public.fluency_skills (id, generator_key, name, description, category) VALUES
  ('fma-formulas', 'fma-formulas', 'F=ma formulas',
   'Recall the formulas the F=ma solutions actually cite -- a = v^2/r and omega^2 r, omega = sqrt(k/m), moments of inertia, orbits, buoyancy -- and plug numbers into them.',
   'formulas')
ON CONFLICT (id) DO NOTHING;

-- ── Turn it on for Leo ──────────────────────────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'leo', 'fma-formulas'
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'leo')
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- ── Same for the persistent test student, for QA (matches the convention
-- set in the earlier fluency migrations). ──────────────────────────────
INSERT INTO public.fluency_student_skills (student_id, skill_id)
SELECT 'test-student', 'fma-formulas'
WHERE EXISTS (SELECT 1 FROM public.students WHERE id = 'test-student')
ON CONFLICT (student_id, skill_id) DO NOTHING;
