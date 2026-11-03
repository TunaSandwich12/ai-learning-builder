create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null,
  title text not null default 'Untitled activity',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "read own" on public.activities
  for select to authenticated using ((select auth.uid()) = owner_id);

create policy "insert own" on public.activities
  for insert to authenticated with check ((select auth.uid()) = owner_id);

create policy "update own" on public.activities
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "delete own" on public.activities
  for delete to authenticated using ((select auth.uid()) = owner_id);
