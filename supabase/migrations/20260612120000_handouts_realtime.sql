-- Enable Supabase Realtime on the handouts table so the hw_build_daemon
-- can subscribe to INSERT/UPDATE events and auto-trigger builds.
-- Written idempotently: this change is already live on the project DB, so the
-- publication add is guarded to avoid "table already in publication" on re-run.
alter table public.handouts replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'handouts'
  ) then
    alter publication supabase_realtime add table public.handouts;
  end if;
end $$;
