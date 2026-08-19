-- Scratch work is a photo of the student's handwriting. The bucket was created
-- public, so anything uploaded was readable by anyone with the URL, with no
-- authentication at all -- and those URLs get pasted into <a href> and leak
-- through history and referrers.
--
-- Making the bucket private means getPublicUrl() no longer resolves, so
-- fma_attempts.scratch_work_url now stores the OBJECT PATH and the app mints a
-- short-lived signed URL on demand. The SELECT policies added in
-- 20260819150000 (linked student) and 20260819120000 (admin) are what authorize
-- signing, so both can still read their own files.

UPDATE storage.buckets SET public = false WHERE id = 'fma-scratch-work';

COMMENT ON COLUMN public.fma_attempts.scratch_work_url IS
  'Storage object path within the private fma-scratch-work bucket (not a URL); '
  'resolve with createSignedUrl().';
