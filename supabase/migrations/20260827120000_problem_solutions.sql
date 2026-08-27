-- Worked solutions for the AoPS course problems in the problem bank, shown in
-- the admin's problem preview.
--
-- These cannot ride along with the problems themselves. The bank is served from
-- data/aops-*.json in a PUBLIC GitHub repo, so a solution added there would be
-- published to the open internet and sit one fetch away from any student with
-- the portal open -- no UI gate could hide it. So solutions live here instead,
-- readable only by is_admin(), exactly like fma_questions.solution
-- (20260821120000), which is withheld from students until an attempt is graded.
--
-- Rows are loaded by scripts/seed_problem_solutions.mjs from EigenNode's
-- master.json, keyed by the same problem id the portal's bank uses.

CREATE TABLE IF NOT EXISTS public.problem_solutions (
  problem_id   TEXT PRIMARY KEY,
  aops_id      TEXT,
  answer       TEXT,
  solution     TEXT,
  figure_urls  TEXT[] NOT NULL DEFAULT '{}',
  diagram_count INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.problem_solutions IS
  'Admin-only worked solutions for problem-bank problems, synced from EigenNode.';
COMMENT ON COLUMN public.problem_solutions.diagram_count IS
  'Asymptote figures in the source solution that the portal cannot render; the '
  'preview says how many are missing rather than pretending the prose is whole.';

ALTER TABLE public.problem_solutions ENABLE ROW LEVEL SECURITY;

-- The seed script writes with the secret key. That bypasses RLS but not the
-- plain SQL grant, which has to be explicit here (cf. session_problems in
-- 20260820120000, which was missed and failed with "permission denied").
GRANT ALL ON public.problem_solutions TO service_role;
GRANT SELECT ON public.problem_solutions TO authenticated;
REVOKE ALL ON public.problem_solutions FROM anon;

-- The project's default privileges hand `authenticated` TRUNCATE on every new
-- table, and TRUNCATE is not subject to RLS -- any logged-in student could wipe
-- the synced solutions. Taken back here; the same grant is still outstanding on
-- the older tables.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.problem_solutions FROM authenticated;

DROP POLICY IF EXISTS "problem_solutions: admin read" ON public.problem_solutions;
CREATE POLICY "problem_solutions: admin read" ON public.problem_solutions
  FOR SELECT TO authenticated USING (public.is_admin());
