# Admin Access Guide

Audience: Site owners administering access to the admin dashboard and protected APIs.

## What This Sets Up
- Google-based login via Supabase on `/admin/login`.
- Any visit to `/admin/*` (pages) or `/api/*` (APIs) requires authentication and approval.
- New signups trigger an email to the owner for approval.
- An owner-only dashboard lists pending requests and approved admins, with actions to approve or revoke.

## Prerequisites
- Supabase project configured with Google OAuth provider.
- Environment variables set in your deployment:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` (e.g., https://yourdomain.com)
  - `OWNER_EMAIL` (the primary site owner’s email)
  - SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - Optional bootstrap: `ADMIN_EMAILS` (comma-separated allowlist) for initial access

## User Flow
1. A user navigates to an admin page (e.g., `/admin/inventory`) or a protected API endpoint.
2. If not logged in, they are redirected to `/admin/login`.
3. They click “Continue with Google” and authenticate.
4. If their email is not approved yet:
   - Their request is recorded as “pending”.
   - An email notification is sent to `OWNER_EMAIL`.
   - The user is shown a Pending Approval screen and signed out of the session.
5. If approved, the user is redirected to the originally requested admin page and gains access to protected APIs.

Notes:
- API calls from scripts/tools typically receive 401/403 JSON instead of an HTML redirect. Browser navigations redirect to login for a better UX.

## Approving and Revoking Access
The owner manages access at `/admin/access`.

### Approve a New User
1. Open `/admin/access` (owner-only).
2. Locate the user in the “Pending Requests” list.
3. Click “Approve”. The user is added as an `admin` and their request is marked approved.
4. (Optional) The user can receive a confirmation email with a link to `/admin`.

### Revoke an Existing Admin
1. In `/admin/access`, switch to the “Approved Admins” list.
2. Find the user and click “Revoke”.
3. The user’s admin role is removed and their next request will be blocked/redirected.

### Reject a Pending Request
1. In “Pending Requests”, click “Reject”.
2. The request is marked rejected. The user will see Pending/Denied messaging upon next attempt.

## Email Notifications
- Owner receives: “Admin access request pending approval” when a new request is created.
- (Optional) User receives: “Your admin access was approved” when approved.
- Duplicate notifications for the same email are throttled to reduce noise.

## Roles and Ownership
- Owner is the ultimate approver. The owner email is taken from `OWNER_EMAIL` (and can also be seeded via `ADMIN_EMAILS`).
- Admins have access to admin pages and APIs but cannot approve other users unless designated as owner.

## Troubleshooting
- Redirect loops: Ensure `NEXT_PUBLIC_SITE_URL` and Supabase OAuth redirect URLs match your deployment domain.
- Not receiving emails: Verify SMTP settings and spam folders; confirm `OWNER_EMAIL` is correct.
- User can’t access after approval: Have them log out/in again; verify their email exactly matches the approved entry.
- API clients receiving HTML: Use an HTTP client that sets `Accept: application/json` to receive JSON 401/403.

## Security Notes
- Service-role key is used only on the server (API routes, middleware); never expose it in the browser.
- RLS is enabled on approval-related tables; only server endpoints can mutate.
- In production, do not configure `ADMIN_TOKEN` backdoor.

## Operational Tips
- Keep a backup list of approved admin emails.
- Periodically review the approved list and revoke unused accounts.
- Test the flow in staging after changing OAuth settings or domains.

