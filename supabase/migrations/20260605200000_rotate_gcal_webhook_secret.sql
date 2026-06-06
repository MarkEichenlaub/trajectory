-- Rotate the gcal_webhook_secret after the original value was inadvertently
-- committed in plaintext in the previous migration. The new value matches what
-- is now set as the GCAL_WEBHOOK_SECRET edge-function secret in the Supabase
-- dashboard. Do NOT hardcode secrets in migration files going forward.
UPDATE public.app_config
SET value = 'fcedfc7b-5825-461a-8ae6-5963e1a060c4',
    updated_at = now()
WHERE key = 'gcal_webhook_secret';
