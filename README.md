This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
# little-kobe-chakra

## Admin Authentication (Supabase Auth)

Admin API routes under `/api/admin/*` are protected. The guard supports three mechanisms (in order):

- ADMIN_TOKEN fallback (dev/non‑prod):
  - Set `ADMIN_TOKEN` in your environment.
  - Send either header `x-admin-token: $ADMIN_TOKEN` or `Authorization: Bearer $ADMIN_TOKEN`.

- Supabase access token (recommended):
  - The admin UI authenticates via Supabase Auth (e.g., email OTP, OAuth).
  - The API extracts the access token from `Authorization: Bearer <jwt>` or from the `sb-access-token` cookie (when using `@supabase/auth-helpers-nextjs`).
  - The server verifies the user via `supabase.auth.getUser(token)` and then enforces RBAC:
    - If `ADMIN_EMAILS` env is set (comma‑separated), any matching email is authorized.
    - Else it looks up `user_roles` for `{ user_id, role }` and requires `role = 'admin'`.

- Optional DB Role Table:
  - Create a simple roles table in Supabase:
    ```sql
    create table if not exists public.user_roles (
      user_id uuid primary key references auth.users(id) on delete cascade,
      role text not null check (role in ('admin','staff','user'))
    );
    create index if not exists idx_user_roles_role on public.user_roles(role);
    ```
  - Insert your admin user: `insert into public.user_roles(user_id, role) values ('<uuid>', 'admin');`

Environment variables used:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client and server verification of tokens.
- `SUPABASE_SERVICE_ROLE_KEY`: Server‑only; used to query `user_roles` (never expose to browser).
- `ADMIN_EMAILS` (optional): Comma‑separated list of admin emails (quick allowlist).
- `ADMIN_TOKEN` (optional): Dev fallback secret for headless access.

Implementation details:

- Guard lives in `src/server/utils/adminAuth.js`.
- Admin routes import `requireAdminAuth` and return 401/403 on failure.
- You can keep `ADMIN_TOKEN` in local dev and rely on `user_roles`/`ADMIN_EMAILS` in staging/prod.
