alter table public.sessions
  add column if not exists end_time timestamptz,
  add column if not exists miro_pdf_url text;
