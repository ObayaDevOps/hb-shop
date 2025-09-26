-- Email-first admin access setup (allow user_id to be NULL initially)
-- Paste this into Supabase SQL editor. Replace owner@example.com with your real owner email.

-- Ensure UUID generator is available
create extension if not exists pgcrypto;

-- Ensure user_roles table exists (won't change existing columns if present)
create table if not exists public.user_roles (
  user_id uuid,
  email text,
  role text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure required columns and types exist
alter table public.user_roles add column if not exists user_id uuid;
alter table public.user_roles add column if not exists email text;
alter table public.user_roles add column if not exists role text;
alter table public.user_roles add column if not exists created_at timestamptz default now();
alter table public.user_roles add column if not exists updated_at timestamptz default now();

-- Ensure id default exists if previous migration added id as PK
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_roles' and column_name = 'id'
  ) then
    alter table public.user_roles alter column id set default gen_random_uuid();
  end if;
end $$;

-- Allow seeding by email before we know the user_id
alter table public.user_roles alter column user_id drop not null;

-- Normalize the role constraint to expected values
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check check (role in ('owner','admin'));

-- Helpful indexes and uniqueness
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_email on public.user_roles(email);
create unique index if not exists uniq_user_roles_email_role on public.user_roles(email, role);

-- Ensure admin_signup_requests exists (for pending approvals)
create table if not exists public.admin_signup_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid,
  provider text default 'google',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_admin_signup_requests_email on public.admin_signup_requests(email);
create index if not exists idx_admin_signup_requests_status on public.admin_signup_requests(status);
create unique index if not exists uniq_admin_signup_requests_pending_email
  on public.admin_signup_requests(email)
  where status = 'pending';

-- Keep updated_at in sync
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_user_roles_updated on public.user_roles;
create trigger set_user_roles_updated before update on public.user_roles
for each row execute function set_updated_at();

drop trigger if exists set_admin_signup_requests_updated on public.admin_signup_requests;
create trigger set_admin_signup_requests_updated before update on public.admin_signup_requests
for each row execute function set_updated_at();

-- Enable RLS (server uses service-role; owner dashboard uses server APIs)
alter table public.user_roles enable row level security;
alter table public.admin_signup_requests enable row level security;

-- Seed the owner by email (replace the email below, keep lower(...))
insert into public.user_roles (email, role)
values (lower('owner@example.com'), 'owner')
on conflict (email, role) do nothing;

-- Optional: Backfill user_id after the owner has signed in once
-- Replace owner@example.com below and run this again later
update public.user_roles ur
set user_id = u.id
from auth.users u
where lower(ur.email) = lower('owner@example.com')
  and lower(u.email) = lower('owner@example.com')
  and ur.user_id is null;
