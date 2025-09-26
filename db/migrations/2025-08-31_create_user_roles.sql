-- Create a simple roles table for admin RBAC with Supabase Auth
-- Safe to paste into the Supabase SQL editor.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff','user')),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_role on public.user_roles(role);

-- Example seed (replace with a real auth.users UUID):
-- insert into public.user_roles(user_id, role) values ('00000000-0000-0000-0000-000000000000', 'admin')
-- on conflict (user_id) do update set role = excluded.role;

-- Optional: RLS policies (enable if you want DB-side enforcement)
-- alter table public.user_roles enable row level security;
-- create policy "self-can-read-role" on public.user_roles
--   for select using (auth.uid() = user_id);
-- create policy "only-admins-write-roles" on public.user_roles
--   for all to authenticated using (false) with check (false);
