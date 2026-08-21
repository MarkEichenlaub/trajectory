-- session_problems was only ever granted to `authenticated`, never `service_role`
-- (unlike every other table), so the secret-key admin client gets a plain SQL
-- "permission denied for table session_problems" on insert/update/delete —
-- independent of and in addition to RLS, which it otherwise bypasses.
GRANT ALL ON public.session_problems TO service_role;
