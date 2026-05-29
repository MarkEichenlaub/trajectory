-- Import Leo's existing progress report (PDF dated March 2026).
insert into public.progress_reports (student_id, title, pdf_url, sessions_covered, created_at)
select 'leo',
       'Progress Report — Spring 2026',
       'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/progress-reports/leo/leo-spring-2026.pdf',
       0,
       '2026-03-15T00:00:00Z'
where not exists (
  select 1 from public.progress_reports where student_id = 'leo'
);
