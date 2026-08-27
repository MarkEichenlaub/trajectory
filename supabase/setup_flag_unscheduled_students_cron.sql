-- Schedule daily "no upcoming session" flag email at 8 AM Pacific (15:00 UTC).
-- Uses the same X-Cron-Secret pattern as send-assignment-reminders.

select cron.schedule(
  'flag-unscheduled-students',
  '0 15 * * *',
  $$
  select net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/flag-unscheduled-students',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb
  )
  $$
);
