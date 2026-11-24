-- Run this once in Supabase → SQL Editor.

create table if not exists public.measures (
  id bigint primary key,
  no text not null,
  title text not null,
  type text,
  author text,
  status text,
  committee text,
  filed date,
  stage_date date,
  mayor date,                 -- approval date
  report text,
  report_link text,
  report_file jsonb,          -- {"id": "<storage path>", "name": "<original filename>"}
  remarks text,
  sessions date[] default '{}',
  updated_at timestamptz default now()
);

alter table public.measures enable row level security;

drop policy if exists "staff all" on public.measures;
create policy "staff all" on public.measures
  for all to authenticated using (true) with check (true);

-- Live updates across open tabs
alter publication supabase_realtime add table public.measures;

-- Private bucket for committee report files
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

drop policy if exists "staff files" on storage.objects;
create policy "staff files" on storage.objects
  for all to authenticated
  using (bucket_id = 'reports') with check (bucket_id = 'reports');
