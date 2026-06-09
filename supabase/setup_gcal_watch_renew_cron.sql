-- Keeps the Google Calendar push-notification ("watch") channel alive.
-- Google expires watch channels after ~7 days; once expired, gcal-webhook stops
-- receiving change notifications and instant session updates silently fall back to
-- the slower daily sync. Re-registering daily keeps the channel fresh so calendar
-- moves/cancels reflect in the portal in real time.
--
-- Run this once in the dashboard SQL editor to activate the job. It also registers
-- the channel immediately so instant updates start working right away.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Daily re-registration at 5 AM UTC (an hour before the session syncs).
select cron.schedule(
  'gcal-watch-renew',
  '0 5 * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/gcal-watch-register',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);

-- Register once now so the watch channel is live without waiting for 5 AM UTC.
select net.http_post(
  url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/gcal-watch-register',
  headers := jsonb_build_object(
    'Content-Type',  'application/json',
    'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
  ),
  body    := '{}'::jsonb
);
