-- Take TRUNCATE (and TRIGGER / REFERENCES / MAINTAIN) away from the two roles
-- the browser can act as.
--
-- Every table in `public` had these granted to BOTH `anon` and `authenticated`,
-- inherited from the project's default privileges. The row-level story is sound
-- -- every DELETE/UPDATE/INSERT grant is gated by an is_admin() or
-- own-student-only policy -- but TRUNCATE is not subject to row-level security
-- at all. A single statement would empty `students`, `invoices` or
-- `fma_attempts` no matter what the policies say, and the same grant sits on
-- storage.objects, where it would drop the record of every uploaded PDF.
--
-- PostgREST exposes no TRUNCATE verb, so this was latent rather than reachable
-- from the portal today. It is still a privilege neither role has any use for:
-- the app writes through RLS-gated DML, and DDL runs as postgres or the service
-- key. TRIGGER and REFERENCES go with it -- also ungated by RLS, also unused.
--
-- Not covered: tables created by `supabase_admin` rather than `postgres` get
-- that role's own default of ALL privileges, and postgres is not a member of
-- supabase_admin so its defaults cannot be altered from here. Every table this
-- app creates is created as postgres, which the ALTER DEFAULT PRIVILEGES below
-- does cover.

-- ── 1. Existing tables in public ────────────────────────────────────────────
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN
    SELECT format('%I.%I', schemaname, tablename) FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON %s FROM anon, authenticated', tbl);
  END LOOP;
END $$;

-- ── 2. Storage ──────────────────────────────────────────────────────────────
-- storage.objects and friends belong to supabase_storage_admin, and this
-- project's postgres role is neither a member of it nor a superuser, so the
-- revoke below does NOT take: those three tables keep Supabase's stock
-- GRANT ALL to anon and authenticated. Left in place because it is the right
-- statement and will apply wherever postgres does own them; the failure is
-- caught so it cannot roll back part 1.
--
-- What makes that acceptable: PostgREST only exposes `public` and
-- `graphql_public` (asking for Accept-Profile: storage returns PGRST106), so
-- neither client role can reach storage.objects with a browser key at all.
-- Uploads and deletes go through the storage API, which authenticates as
-- supabase_storage_admin and enforces the bucket policies separately.
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN
    SELECT format('%I.%I', schemaname, tablename) FROM pg_tables
    WHERE schemaname = 'storage' AND tablename IN ('objects', 'buckets', 'buckets_analytics')
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON %s FROM anon, authenticated', tbl);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'could not revoke on %, owned by another role', tbl;
    END;
  END LOOP;
END $$;

-- ── 3. Tables made from here on ─────────────────────────────────────────────
-- Without this the next CREATE TABLE hands the grants straight back, which is
-- how problem_solutions (20260827120000) got them and had to revoke its own.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage
  REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON TABLES FROM anon, authenticated;
