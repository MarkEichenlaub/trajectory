-- Assignments came out in the order they were created (assigned_date desc), and
-- that's the order the assignment email lists them in. But the order Mark
-- assigns problems in is about his convenience, not the order the student
-- should work them: background reading first, then the problems that depend on
-- it. The admin panel already had drag-to-reorder, but it lived in React state
-- and vanished on reload, so the email kept using creation order.
--
-- sort_order is the manual position within a student's assigned list. Null
-- means "never dragged", and those fall back to assigned_date desc after every
-- row that has been placed by hand.
alter table public.assignments
  add column if not exists sort_order integer;

comment on column public.assignments.sort_order is
  'Manual position in the student''s assigned list (0-based). Null = never '
  'reordered; those sort after the placed rows, newest assigned_date first. '
  'Drives the order in the assignment email and the student portal.';

create index if not exists assignments_student_sort_idx
  on public.assignments (student_id, sort_order);
