-- The initial recurring_schedules migration granted service_role but forgot
-- the base table grant to `authenticated` — RLS policies only filter rows a
-- role can already see; without this grant, PostgREST returns 42501
-- "permission denied" for every request from the browser, RLS policy or not.
-- Same class of bug as 20260820120000_grant_session_problems_service_role.sql,
-- just the other role.

grant select, insert, update, delete on public.recurring_schedules to authenticated;
