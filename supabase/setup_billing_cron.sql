select cron.schedule(
  'bill-sessions',
  '*/5 * * * *',
  $$
  select net.http_post(
    url    := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/bill-sessions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnRheGJudHFoY2ZxdGF6Ym50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTcyMDcsImV4cCI6MjA5NTQ5MzIwN30.uPWnJGvQQtCfbpZj3Slwdq8jA3p40NupQWK5F9ViNHM"}'::jsonb,
    body   := '{}'::jsonb
  )
  $$
);
