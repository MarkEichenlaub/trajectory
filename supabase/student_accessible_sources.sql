-- Student-accessible problem sources
-- Stores which problem sources (contests, handout sources) each student can
-- browse in their problem bank. Run in Supabase SQL Editor.

-- Table: which sources each student can access
CREATE TABLE public.student_accessible_sources (
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  source     TEXT NOT NULL,
  PRIMARY KEY (student_id, source)
);

ALTER TABLE public.student_accessible_sources ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.student_accessible_sources TO service_role;

-- Students can read their own accessible sources
CREATE POLICY "student_accessible_sources: self read"
  ON public.student_accessible_sources FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

-- Students can mark problems as completed from the bank (insert new completed assignment)
CREATE POLICY "assignments: student insert completed"
  ON public.assignments FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    AND status = 'completed'
  );

-- Students can update their own assignments to completed status only
CREATE POLICY "assignments: student update completed"
  ON public.assignments FOR UPDATE
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  )
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    AND status = 'completed'
  );

-- Handouts: allow authenticated users to read (for student bank browsing)
CREATE POLICY "handouts: authenticated read"
  ON public.handouts FOR SELECT
  TO authenticated
  USING (true);
