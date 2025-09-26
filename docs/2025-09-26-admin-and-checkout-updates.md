# Admin & Checkout Updates — 2025-09-26

This document summarizes recent changes in simple terms.

## Admin Improvements

- Login loop fixed: after Google sign‑in, we now sync the Supabase session into secure, HTTP‑only cookies so the server can recognize you immediately.
  - New endpoints: `POST /api/auth/sync-cookie` and `POST /api/auth/clear-cookie`.
- New Admin navigation bar shown on all admin pages:
  - Links: `/admin` (home), `/admin/inventory`, `/admin/sales-report`.
  - Owner‑only link: `/admin/access` appears only if your role is `owner`.
  - Shows your email + role badge and a Logout button.
- New Admin landing page at `/admin`:
  - Displays your profile (email, user id, name if available) and your role.
- Middleware scaffold for admin routes:
  - `middleware.ts` runs on `/admin/*` (currently pass‑through, ready for future enhancements).

## Admin Tests

- AdminNavBar: links, owner‑only visibility, logout behavior.
- Admin landing page: profile info and role.
- Auth cookies: sync and clear cookie behaviors.
- Middleware helper: admin path matcher.

Run tests: `npm test`

## Checkout: Delivery Estimate

- After dropping a map pin, the page shows an “Estimated Delivery” panel:
  - Distance computed from HQ “36 Kyadondo Road, Kampala”.
  - Uses Google Distance Matrix (driving) when available; falls back to straight‑line (haversine) if not.
  - Fee = distance_km × 800 UGX, rounded up to the nearest 1,000 UGX.
  - Free delivery if the cart total exceeds 200,000 UGX (shows green “Free delivery!” message).

Notes:
- No extra configuration needed beyond existing Google Maps key for the best distance accuracy.
- The estimate is informative; payment totals remain unchanged unless we later include delivery in order pricing.

