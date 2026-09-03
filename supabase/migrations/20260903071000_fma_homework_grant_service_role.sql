-- Same gap as 20260819130000_fma_grant_service_role.sql: tables need explicit
-- grants to service_role in this project. Without this, scripts/seed_fma_homework.mjs
-- (authenticating as service_role via the service key) can't write rows.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_homework_questions       TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_homework_attempts        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fma_homework_attempt_answers TO service_role;
