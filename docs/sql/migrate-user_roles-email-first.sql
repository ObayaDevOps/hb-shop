-- Migrate existing public.user_roles to support email-first approvals
-- This moves the primary key off user_id to a surrogate id column, then allows user_id to be NULL.
-- Safe to run multiple times.

-- 0) Ensure UUID generation is available
create extension if not exists pgcrypto;

-- 1) Drop existing primary key (likely on user_id), if any
do $$
declare
  pk_name text;
begin
  select conname
    into pk_name
  from pg_constraint
  where conrelid = 'public.user_roles'::regclass
    and contype = 'p'
  limit 1;
  if pk_name is not null then
    execute 'alter table public.user_roles drop constraint ' || quote_ident(pk_name);
  end if;
end $$;

-- 2) Ensure a surrogate id column exists and is populated
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_roles' and column_name = 'id'
  ) then
    alter table public.user_roles add column id uuid;
  end if;
  update public.user_roles set id = gen_random_uuid() where id is null;
end $$;

-- 3) Set primary key on id (idempotent)
do $$
declare
  pk_name text;
begin
  select conname
    into pk_name
  from pg_constraint
  where conrelid = 'public.user_roles'::regclass
    and contype = 'p'
  limit 1;
  if pk_name is null then
    alter table public.user_roles add primary key (id);
  end if;
end $$;

-- Ensure new inserts auto-generate id
alter table public.user_roles alter column id set default gen_random_uuid();

-- 4) Allow user_id to be NULL (email-first approval)
alter table public.user_roles alter column user_id drop not null;

-- 5) Ensure core columns and role constraint are correct
alter table public.user_roles add column if not exists email text;
alter table public.user_roles add column if not exists role text;
alter table public.user_roles add column if not exists created_at timestamptz default now();
alter table public.user_roles add column if not exists updated_at timestamptz default now();
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check check (role in ('owner','admin'));

-- 6) Helpful indexes and uniqueness
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_email on public.user_roles(email);
create unique index if not exists uniq_user_roles_email_role on public.user_roles(email, role);

-- 7) Optional: updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_user_roles_updated on public.user_roles;
create trigger set_user_roles_updated before update on public.user_roles
for each row execute function set_updated_at();

-- After running this migration, you can run docs/sql/setup-email-first.sql to seed owner by email
-- and finalize any remaining approval tables/indexes.
