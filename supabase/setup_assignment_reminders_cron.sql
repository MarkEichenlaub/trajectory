-- Schedule daily assignment reminder emails at 7 AM Pacific (14:00 UTC).
-- Uses the same X-Cron-Secret pattern as bill-sessions.

select cron.schedule(
  'send-assignment-reminders',
  '0 14 * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/send-assignment-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
