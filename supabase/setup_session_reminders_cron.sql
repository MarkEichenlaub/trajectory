-- Schedule session reminder emails to run every minute.
-- The edge function looks for sessions starting in 8–13 minutes with no reminder sent yet.

select cron.schedule(
  'send-session-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/send-session-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
