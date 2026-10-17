-- ==============================================================================
-- API Sentinel - Supabase Database Schema
-- Description: Core schema for API testing hackathon app including profiles,
--              saved requests, execution history, and user preferences.
-- Usage: Paste directly into the Supabase SQL Editor and click "Run".
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE & SIGNUP TRIGGER
-- ==============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Trigger function to automatically create a profile record on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and re-create trigger for idempotency
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 2. SAVED_REQUESTS TABLE
-- ==============================================================================

create table if not exists public.saved_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text,
  method text default 'GET',
  url text,
  headers jsonb default '{}'::jsonb,
  body text,
  expected_status int,
  expected_keys text[],
  created_at timestamptz default now()
);

-- Index for fast user request lookups
create index if not exists idx_saved_requests_user_id on public.saved_requests(user_id);

-- ==============================================================================
-- 3. REQUEST_HISTORY TABLE
-- ==============================================================================

create table if not exists public.request_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  method text,
  url text,
  status int,
  response_time_ms int,
  passed int default 0,
  failed int default 0,
  created_at timestamptz default now()
);

-- Indexes for performance on analytics and history queries
create index if not exists idx_request_history_user_id on public.request_history(user_id);
create index if not exists idx_request_history_created_at on public.request_history(created_at desc);

-- ==============================================================================
-- 4. USER_PREFERENCES TABLE
-- ==============================================================================

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme_choice text default 'dark',
  default_headers jsonb default '{}'::jsonb,
  timeout_ms int default 10000
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.saved_requests enable row level security;
alter table public.request_history enable row level security;
alter table public.user_preferences enable row level security;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- Any signed-in user can view profiles; users can manage only their own profile.
-- ------------------------------------------------------------------------------
drop policy if exists "Signed-in users can read profiles" on public.profiles;
create policy "Signed-in users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Saved Requests Policies
-- Users can select, insert, update, and delete only their own saved requests.
-- ------------------------------------------------------------------------------
drop policy if exists "Users can select their own saved requests" on public.saved_requests;
create policy "Users can select their own saved requests"
  on public.saved_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own saved requests" on public.saved_requests;
create policy "Users can insert their own saved requests"
  on public.saved_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved requests" on public.saved_requests;
create policy "Users can update their own saved requests"
  on public.saved_requests
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved requests" on public.saved_requests;
create policy "Users can delete their own saved requests"
  on public.saved_requests
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Request History Policies
-- Users can select, insert, update, and delete only their own request history.
-- ------------------------------------------------------------------------------
drop policy if exists "Users can select their own request history" on public.request_history;
create policy "Users can select their own request history"
  on public.request_history
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own request history" on public.request_history;
create policy "Users can insert their own request history"
  on public.request_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own request history" on public.request_history;
create policy "Users can update their own request history"
  on public.request_history
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own request history" on public.request_history;
create policy "Users can delete their own request history"
  on public.request_history
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- User Preferences Policies
-- Users can select, insert, update, and delete only their own preferences.
-- ------------------------------------------------------------------------------
drop policy if exists "Users can select their own preferences" on public.user_preferences;
create policy "Users can select their own preferences"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own preferences" on public.user_preferences;
create policy "Users can delete their own preferences"
  on public.user_preferences
  for delete
  to authenticated
  using (auth.uid() = user_id);
