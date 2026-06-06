ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS submission_bundle_url text;
