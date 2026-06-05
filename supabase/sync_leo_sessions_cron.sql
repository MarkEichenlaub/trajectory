-- Schedules sync-leo-sessions to run every day at 6 AM UTC.
-- The function lists upcoming "Leo / Mark Physics" Google Calendar events
-- and creates portal sessions + Miro whiteboards for any not yet handled.
--
-- Run this once in the dashboard SQL editor to activate the job.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-leo-sessions',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/sync-leo-sessions',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
