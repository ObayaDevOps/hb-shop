-- Seed admin roles by email
-- How to use:
--  1) Replace the placeholder emails in the ARRAY[...] below with your admin emails.
--  2) Paste this entire script into Supabase SQL editor and run.
--  3) If some emails are reported as missing, create those users in Supabase Auth first
--     (e.g., send magic link / sign-up) so they appear in auth.users, then re-run.

-- EDIT THESE EMAILS ↓↓↓
with input_emails as (
  select lower(unnest(ARRAY[
    'admin1@example.com',
    'admin2@example.com'
  ]))::text as email
),
existing as (
  select u.id, lower(u.email) as email
  from auth.users u
  join input_emails i on lower(u.email) = i.email
)
insert into public.user_roles(user_id, role)
select id, 'admin' from existing
on conflict (user_id) do update set role = excluded.role;

-- Optional: report any emails that are not found in auth.users
select i.email as missing_in_auth_users
from input_emails i
left join auth.users u on lower(u.email) = i.email
where u.id is null;

