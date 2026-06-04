-- Adds student submission and tutor feedback tracking to assignments.
-- Status flow: assigned → submitted → reviewed → completed

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS submission_url  text,
  ADD COLUMN IF NOT EXISTS submission_at   timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_url    text,
  ADD COLUMN IF NOT EXISTS feedback_at     timestamptz;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback', 'feedback', true)
ON CONFLICT (id) DO NOTHING;

-- Students may upload to their own folder: submissions/{student_id}/...
CREATE POLICY "submissions_student_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Admin may upload feedback
CREATE POLICY "feedback_admin_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'feedback' AND
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_type = 'admin'
  )
);
