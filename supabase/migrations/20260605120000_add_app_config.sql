-- App configuration table for storing sync tokens, channel IDs, etc.
CREATE TABLE IF NOT EXISTS public.app_config (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- No public policies: only service role accesses this table.

-- Store the webhook secret so the pg_cron renewal job can use it.
-- IMPORTANT: set this value manually in Supabase Dashboard → SQL Editor, or via
-- a separate migration/script that is NOT checked into git. Do not hardcode secrets here.
INSERT INTO public.app_config (key, value)
VALUES ('gcal_webhook_secret', 'REPLACE_WITH_SECRET')
ON CONFLICT (key) DO NOTHING;

-- Schedule weekly channel renewal (Google watch channels last up to 30 days)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'renew-gcal-watch',
  '0 12 * * 0',  -- every Sunday at noon UTC
  $$
  SELECT net.http_post(
    url     := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/gcal-watch-register',
    headers := json_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM public.app_config WHERE key = 'gcal_webhook_secret')
    )::jsonb,
    body    := '{}'::jsonb
  )
  $$
);
