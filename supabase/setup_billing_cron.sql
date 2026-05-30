-- Reschedules the bill-sessions cron for the new API-key system.
--
-- bill-sessions is deployed --no-verify-jwt (the old job authenticated with the
-- legacy anon JWT, which is being disabled). Auth is now a shared secret sent in
-- the X-Cron-Secret header and checked inside the function. The secret itself is
-- NOT stored here — it lives in Supabase Vault under the name 'cron_secret' and is
-- read at runtime, so this file carries no credential.
--
-- Prereq (run once, in the dashboard SQL editor — keeps the literal out of git):
--   select vault.create_secret('<CRON_SECRET value>', 'cron_secret');

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
