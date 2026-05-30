-- Reschedule the bill-sessions and export-miro-pdf crons for the new API-key system.
--
-- Both functions are now deployed --no-verify-jwt and authenticate via an
-- X-Cron-Secret header (the legacy anon JWT the old jobs sent is being disabled).
-- The secret is read from Vault at runtime, so no credential lives in this file.
--
-- Prereq (run once in the dashboard SQL editor, NOT committed):
--   select vault.create_secret('<CRON_SECRET>', 'cron_secret');
--
-- cron.schedule upserts by job name, so re-running this is idempotent.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'bill-sessions',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/bill-sessions',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);

select cron.schedule(
  'export-miro-pdfs',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/export-miro-pdf',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
