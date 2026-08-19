-- Tables need explicit grants to service_role in this project (it doesn't get
-- an automatic RLS-bypass grant — see 20260630120000_grant_app_config_service_role.sql
-- for the same gap on app_config). Without this, scripts/seed_fma_questions.mjs
-- (which authenticates as service_role via the service key) can't write rows.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_questions       TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_attempts        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_attempt_answers TO service_role;
