-- Renew the Google Calendar watch channel daily instead of weekly.
--
-- add_app_config originally scheduled renew-gcal-watch weekly ('0 12 * * 0'), but
-- Google calendar watch channels expire after only ~7 days. Weekly renewal at a
-- 7-day expiry leaves no margin: a single failed renewal run silently drops
-- real-time calendar -> sessions updates until the next week (the daily sync cron
-- is the only backstop in between). Renew daily so one missed run self-heals the
-- next morning, well inside the channel's lifetime.
do $$
declare jid int;
begin
  select jobid into jid from cron.job where jobname = 'renew-gcal-watch';
  if jid is not null then
    perform cron.alter_job(job_id := jid, schedule := '0 5 * * *');
  end if;
end $$;
