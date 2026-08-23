-- Schedules sync-recurring-sessions to run every day at 6:10 AM UTC (10 min
-- after the existing Leo/Borna-specific jobs, so they never race on the same
-- calendar). The function loops every active row in recurring_schedules and
-- expands its Google Calendar series into portal sessions + Miro whiteboards.
--
-- Run this once in the dashboard SQL editor to activate the job.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-recurring-sessions',
  '10 6 * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/sync-recurring-sessions',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
