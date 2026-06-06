-- Check India's current assignments
SELECT a.id, a.requires_submission, a.status, a.problem_id
FROM public.assignments a
WHERE a.student_id = 'india'
ORDER BY a.assigned_date DESC;

-- Set pretest to requires_submission = true
UPDATE public.assignments
SET requires_submission = true
WHERE student_id = 'india'
  AND problem_id IN (
    SELECT id::text FROM public.handouts WHERE LOWER(name) LIKE '%pretest%'
  );

-- Set velocity handout to requires_submission = false
UPDATE public.assignments
SET requires_submission = false
WHERE student_id = 'india'
  AND problem_id IN (
    SELECT id::text FROM public.handouts WHERE LOWER(name) LIKE '%velocity%'
  );

-- Verify
SELECT a.id, a.requires_submission, a.status, a.problem_id
FROM public.assignments a
WHERE a.student_id = 'india'
ORDER BY a.assigned_date DESC;
