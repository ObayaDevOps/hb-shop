# Mobile App Delivery Plan

## Goals & Guardrails
- Match current Little Kobe shopping experience (catalog, cart, checkout, admin-triggered flows) with near-identical branding, colors, and animation tone
- Reuse existing Sanity catalog, Supabase auth/payments tables, Pesapal, email, and webhook pipelines wherever practical
- Ship production-ready binaries to Apple App Store and Google Play with maintainable CI/CD
- Keep web storefront running; favor shared logic to avoid drift

## Snapshot of the Web App (what we must mirror)
- UI layer: Next.js 14 + Chakra UI theme, custom components in `src/components`, animation via Framer Motion, responsive grid-driven layouts
- Content & inventory: Sanity CMS (`sanity/`, GROQ queries in pages) plus Supabase `inventory` mirror helpers in `src/lib/db.js`
- Cart & state: `src/lib/cartStore.js` uses Zustand with persisted storage, quantity controls in cart/checkout pages
- Checkout: Google Maps picker & distance fee (`src/pages/checkout.js`), form validation, delivery estimate messaging
- Payments: Pesapal Direct Order API orchestration (`src/lib/pesapal.js`, `src/pages/api/payments/*`), Supabase `payments` table for status tracking, email notifications
- Admin/auth: Supabase auth guards for `/api/admin/*`, optional ADMIN_TOKEN fallback
- Misc: contact forms via Nodemailer, analytics endpoints, webhook handlers, E2E tests with Playwright, unit tests with Vitest

## Mobile Delivery Options (pick based on priorities)
### Option A — React Native + Expo (recommended)
- Pros: JavaScript/TypeScript continuity, Expo tooling, OTA updates, reuse business logic (Zustand, API clients), large ecosystem
- Styling: Port Chakra theme tokens to NativeBase (Chakra-compatible RN lib) or Tamagui; reuse palette/spacing to maintain look
- Access to maps (`react-native-maps`), deep linking, push notifications, secure storage, Pesapal via webview/custom tabs
- Cons: Rebuild UI components, need to polyfill some browser-only libs

### Option B — Capacitor/Ionic wrapper around existing Next.js PWA
- Pros: Fastest route, minimal rewrite, retains exact styling
- Cons: WebView performance limits, offline cart reliability depends on browser storage, harder to access native maps/push, App Store review risk if app is “just a website”
- Viable if timeboxed MVP and native reach is urgent, but plan for native rebuild later

### Option C — Flutter (or Swift/Kotlin) rebuild
- Pros: High-performance native UI, one codebase in Dart, ready-made widget libraries
- Cons: Throw away React expertise, reimplement APIs, new styling system, longer ramp-up; only choose if org strategy already embraces Flutter

## Recommended Path: Option A Execution
### Phase 0 — Discovery & Foundations (1–2 weeks)
- Audit Chakra theme + custom CSS in `src/styles` to codify colors, typography, spacing, shadows; export as JSON design tokens
- Catalogue API contracts (Sanity GROQ queries, `/api` routes) and auth flows; document request/response shapes
- Decide on monorepo structure (Nx/Turborepo) to host `web/` and new `mobile/` packages with shared libs (`packages/core`, `packages/ui`)
- Confirm Pesapal mobile strategy (REST integration vs secure WebView), gather SDK requirements, ensure PCI considerations met

### Phase 1 — Shared Core Modules (2 weeks)
- Create `packages/core`: TypeScript models, data mappers, cart math, form schemas; reuse Zustand store logic with storage adapters (AsyncStorage/MMKV)
- Wrap existing Next.js API endpoints with typed client (REST or tRPC) for reuse in web + mobile
- Implement design token pipeline (Style Dictionary or Tailwind config exporter) feeding both Chakra (web) and NativeBase/Tamagui (mobile)
- Set up Expo app skeleton with `expo-router`, TypeScript, EAS profiles, linting, Jest + React Native Testing Library baseline

### Phase 2 — Catalog & Cart Experience (3–4 weeks)
- Build home, category, product detail, search, and cart screens using NativeBase components styled via shared tokens
- Port animations with `moti` / `react-native-reanimated` to approximate Framer Motion behavior (hero transitions, grid fade-ins)
- Integrate Sanity via GROQ queries using existing dataset/project IDs; add caching layer (React Query / SWR) with offline-first policy
- Reuse Zustand store for cart, backed by `expo-secure-store`/`mmkv` persistence for reliability
- Implement image handling via Sanity CDN + Cloudinary transformations, ensuring responsive sizes and caching

### Phase 3 — Checkout, Payments, and Location (3 weeks)
- Recreate checkout form with React Hook Form + Zod (shared schemas) to maintain validation parity
- Embed Google Maps: use `react-native-maps` with Google provider + Geocoding API via backend helper; support manual address entry + pin drop similar to web UX
- Delivery estimate: reuse distance calculation logic by moving existing helpers into shared service; fallback to HQ coords when offline
- Pesapal integration: 
  - Primary: Call existing `/api/payments/create-order` to get the iframe URL, render inside `react-native-webview`, intercept success callback to finalize order
  - Secondary: Explore Pesapal Direct Order V3 mobile API for native card flow; if viable, shift signing logic to secure backend function
- After payment, trigger Supabase update + notifications via existing API endpoints; clear cart store

### Phase 4 — Polish, Device Features, Launch (2–3 weeks)
- Implement auth (if customers need Supabase login) via `@supabase/supabase-js` for RN + deep link magic links
- Add native capabilities: push notifications (Expo Notifications) for order status, share sheet, contact via WhatsApp deep link mirroring `/pages/contact`
- QA: device matrix testing (iOS/Android phones + tablets), align typography/layout with design tokens, ensure accessibility (VoiceOver/TalkBack focus order)
- Observability: integrate Sentry for RN, monitor API usage, set up feature flagging if needed
- Beta distribution via EAS Build/TestFlight/Play Store Internal Testing; gather feedback; finalize store metadata, privacy policy, payment disclosures

## Cross-Cutting Considerations
- Styling parity: build a Figma checklist; ensure tokens cover gradients, drop shadows, icon sizes; create snapshot tests for key screens
- State & networking: adopt React Query + Zustand; ensure offline queue for cart and delivery location
- Testing: unit (Jest), component (React Native Testing Library), end-to-end (Detox or Maestro) covering add-to-cart, checkout, payment success/failure
- Security: keep secrets server-side; use Supabase service key only in API routes; secure WebView (disable JS injection, allowlisted domains)
- Performance: lazy-load heavy modules (maps, webview), prefetch catalog data, compress images via Sanity/CDN params
- Accessibility & localization: reuse locale strings, support right-to-left if future requirement, ensure large-text compatibility

## Risks & Mitigations
- Pesapal native support uncertainty → start with WebView fallback; schedule spike with Pesapal support early
- Design drift between web/mobile → centralize tokens + cross-platform Storybook to preview components
- API coupling with Next.js routes → document versioned contracts; consider extracting critical APIs to standalone serverless functions for stability
- Store review rejection for webview payments → provide native-feeling UX, document Pesapal compliance, include customer service contact
- Timeline creep due to feature parity → prioritize must-have screens first, defer admin features to web or later phases

## Next Steps
1. Confirm chosen option with stakeholders (recommend Option A)
2. Approve budget/timeline and assign leads (mobile dev, backend, design)
3. Kick off Phase 0 discovery workshops and create shared backlog in project tracker
