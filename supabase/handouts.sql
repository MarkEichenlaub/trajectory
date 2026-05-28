-- Handouts table
-- Run in Supabase SQL Editor

create table public.handouts (
  id          text primary key,
  source      text not null,
  name        text not null,
  description text default '',
  topics      text[] default '{}',
  tags        text[] default '{}',
  pdf_url     text default '',
  created_at  timestamptz default now()
);

alter table public.handouts enable row level security;

grant all on public.handouts to service_role;

-- Also create the storage bucket via the Supabase dashboard:
--   Storage → New bucket → Name: "handout-pdfs" → Public bucket: ON
-- Or run this if using supabase CLI:
--   supabase storage create handout-pdfs --public
