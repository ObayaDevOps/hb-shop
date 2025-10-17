# Commerce Hub Full Implementation Plan

This plan expands the high-level roadmap into actionable tasks with sequencing, owners, and acceptance criteria. It is the authoritative checklist for the Supabase-first Commerce Hub rollout while maintaining Sanity for marketing content.

---

## Phase 0 — Foundations & Planning

### 0.1 Project Setup
- [ ] Confirm stakeholders and assign core roles (Engineering lead, Product/Design, QA, Ops).
- [ ] Schedule standing syncs and define communication channels (Slack, status doc).
- [ ] Review existing architecture (Supabase schemas, Sanity usage, payment flows) and capture constraints.

### 0.2 Requirements & Success Criteria
- [ ] Finalize detailed requirements with merch, marketing, and ops teams.
- [ ] Document success metrics (time-to-publish, zero-impact cutover, variant extensibility).
- [ ] Align on release milestones and go/no-go checklist.

### 0.3 Technical Design
- [ ] Produce ERD for new Supabase schema (products, variants, inventory, media, categories, options, collections).
- [ ] Validate schema with engineering team; run through sample data for single-variant and multi-variant products.
- [ ] Update migration SQL scripts and ensure version control via `/db/migrations`.
- [ ] Decide on service layer pattern (e.g., repository + service classes vs. direct Supabase queries) and document conventions.

### Acceptance Criteria
- Shared design doc signed off by stakeholders.
- Database migration scripts drafted and peer-reviewed.
- Project tracking board created with initial backlog.

---

## Phase 1 — Schema & Service Layer

### 1.1 Supabase Schema Implementation
- [x] Write migrations to create `categories`, `products`, `product_options`, `product_option_values`, `product_variants`, `inventory_items`, `product_media`, optional `collections` tables.
- [x] Add supporting indexes, foreign keys, default values, and check constraints (e.g., currency codes, positive quantities).
- [x] Implement triggers or supabase functions for updated timestamps and cascading deletes (e.g., delete media when product removed).
- [x] Add audit columns (`created_by`, `updated_by`, `_legacy_ref` JSONB) where needed for migration traceability.

### 1.2 Supabase Policies & Access Control
- [ ] Define RLS policies for public reads vs. admin writes (service-role bypass for server).
- [ ] Update existing Supabase service client usage (`src/lib/supabaseClient.js`) to account for new tables.
- [ ] Create limited public views (e.g., `public_products`) for storefront read access if needed.

### 1.3 Service Layer & API Endpoints
- [ ] Create server-side services for Categories, Products, Variants, Inventory, Media with validation (zod or yup).
- [ ] Implement Next.js API routes or server actions under `/api/commerce/*` protected by `requireAdminAuth`.
- [ ] Add logging and error handling consistent with existing utils (`src/server/utils/logger.js`).
- [ ] Write integration tests (Vitest/MSW) covering CRUD operations, validation failures, and auth checks.

### Acceptance Criteria
- Migrations deploy cleanly to staging Supabase.
- API endpoints return expected responses and pass automated tests.
- RLS policies verified via Supabase dashboard or unit tests.

---

## Phase 2 — Admin UI (Commerce Hub MVP)

### 2.1 UX & Visual Design
- [ ] Produce Figma mockups capturing Shopify-inspired layout: product list, product detail tabs, media library, inventory list.
- [ ] Run quick user review with merch/ops stakeholders; integrate feedback.

### 2.2 Admin Shell & Navigation
- [ ] Add “Commerce Hub” entry to admin navigation (`src/components/Admin/AdminNavBar.jsx`).
- [ ] Scaffold Next.js page `src/pages/admin/commerce-hub/index.jsx` with Chakra layout, breadcrumbs, and responsive sizing.

### 2.3 Product List View
- [ ] Build searchable/sortable table of products (title, status, stock, updated date).
- [ ] Implement filters (category, stock status, published/draft).
- [ ] Add “New Product” CTA; wire to creation modal or detail page.

### 2.4 Product Detail Editor
- [ ] Tab 1: Overview — fields for title, handle, description (rich text), status toggle, SEO metadata.
- [ ] Tab 2: Media — drag/drop uploader integrated with Vercel Blob, reorderable list, alt text editor, delete.
- [ ] Tab 3: Pricing & Inventory — variant table (initially single default variant) with price, compare-at, cost, quantity, low-stock threshold.
- [ ] Tab 4: Organization — categories (multi-select), tags, collections; inline creation modals.
- [ ] Tab 5: Options/Variants — ability to add option names, generate variant combinations, edit SKUs and barcodes.
- [ ] Implement optimistic UI or loading states; handle validation errors gracefully.

### 2.5 Media Library (Optional in MVP but plan-ready)
- [ ] Standalone media gallery page with search, filtering by product, bulk delete.
- [ ] Provide reusable media picker component for future features.

### 2.6 State Management & Hooks
- [ ] Create hooks for fetching products (`useProducts`, `useProductDetail`) using SWR or React Query with caching.
- [ ] Manage form state with React Hook Form or custom hook to handle nested objects (variants).
- [ ] Ensure unsaved changes prompts before navigation away.

### 2.7 QA & Accessibility
- [ ] Add component-level tests (React Testing Library) for forms, validation, uploader, variant grid.
- [ ] Ensure keyboard navigation and screen-reader labels for media list, tabs, forms.
- [ ] Run responsive checks (desktop, tablet).

### Acceptance Criteria
- Commerce Hub renders end-to-end in staging using Supabase data with sample records.
- CRUD flows (create, update, delete product) work and persist to database.
- Stakeholders validate UX matches Shopify-style expectations.

---

## Phase 3 — Variants, Inventory & Bulk Operations

### 3.1 Advanced Variants
- [ ] Allow adding/removing option values dynamically with automatic variant matrix updates.
- [ ] Provide manual variant creation for non-grid cases; guard against duplicate SKUs.
- [ ] Support per-variant media selection (cover photo, gallery subset).

### 3.2 Inventory Enhancements
- [ ] Implement bulk inventory adjustments (inline editing + save all, or modal).
- [ ] Add CSV import/export for stock levels.
- [ ] Integrate low-stock alerts (email or dashboard notifications) leveraging existing logging utilities.

### 3.3 Collections & Merchandising (Optional but plan now)
- [ ] Define UI for creating collections and assigning products (manual and rules-based placeholder).
- [ ] Ensure collection data surfaces on storefront queries.

### Acceptance Criteria
- Multi-variant products can be created and surfaced in storefront API.
- Inventory adjustments reflected accurately in Supabase.
- Bulk operations tested with sample data sets.

---

## Phase 4 — Storefront Integration & Feature Flagging

### 4.1 Dual-Read Implementation
- [ ] Abstract product fetching in storefront (`src/pages/index.js`, `src/pages/products/[slug].js`) behind a data provider toggle.
- [ ] Implement Supabase-backed fetchers that query new tables (via server functions or Supabase client).
- [ ] Retain Sanity read path controlled via feature flag/env for fallback.

### 4.2 Component Updates
- [ ] Ensure product cards, product detail, cart store (`src/lib/cartStore.js`) handle new product/variant shape (e.g., price on variant).
- [ ] Update checkout flows to reference variant-level quantity and price; adjust `createPendingPayment` input accordingly.
- [ ] Review availability logic to prevent overselling when variants have separate stock.

### 4.3 Testing
- [ ] Write unit/integration tests verifying Supabase data renders correctly.
- [ ] Run E2E tests (Playwright) with Supabase-driven data for browsing, adding to cart, checkout.
- [ ] Perform performance benchmarking (TTFB, image load) before/after switch.

### Acceptance Criteria
- Storefront works seamlessly with Supabase data behind a feature flag.
- No regressions in payment flows or cart functionality.
- Observed performance meets or exceeds previous baseline.

---

## Phase 5 — Migration Execution

(Refer to `sanity-supabase-product-migration.md` for detail; summarize tasks here.)

### 5.1 Tooling Finalization
- [ ] Implement migration script/CLI (`scripts/migrate-products.ts`) aligning with plan.
- [ ] Add dry-run mode, logging, and reporting.
- [ ] Document prerequisites (API keys, output directories, environment variables).

### 5.2 Staging Migration
- [ ] Export Sanity data, run migration into staging Supabase.
- [ ] Execute comparison report; resolve discrepancies.
- [ ] Test Commerce Hub + storefront in staging with migrated dataset.

### 5.3 Production Migration
- [ ] Schedule migration window; notify stakeholders.
- [ ] Run dry-run (no commit) to verify readiness.
- [ ] Execute migration, monitor logs, perform QA spot checks.
- [ ] Flip storefront feature flag to Supabase data once validated.
- [ ] Archive or disable Sanity product queries and webhooks.

### Acceptance Criteria
- Migration logs stored and reviewed (zero critical failures).
- Storefront traffic operates on Supabase data only.
- Rollback plan documented (ability to revert flag to Sanity if necessary).

---

## Phase 6 — Post-Cutover Enhancements & Monitoring

### 6.1 Monitoring & Alerts
- [ ] Set up dashboards for inventory discrepancies, order-to-stock consistency, media upload errors.
- [ ] Implement alerting (Slack/email) for migration failure, low-stock, publish failures.

### 6.2 Documentation & Training
- [ ] Update admin training materials, video walkthroughs, and support docs.
- [ ] Host training session for merch team on Commerce Hub usage.

### 6.3 Tech Debt & Future Features
- [ ] Identify and prioritize backlog items (collections automation, pricing tiers, metafields, analytics widgets).
- [ ] Plan iteration schedule to address feedback and enhancements.

### Acceptance Criteria
- Monitoring dashboards live and reviewed weekly.
- Stakeholders comfortable operating Commerce Hub without engineering support.
- Backlog triaged with clear owners/timelines.

---

## Cross-Cutting Concerns

- **Security**: Ensure all new APIs respect admin auth, audit access logs, and sanitize user-generated content.
- **Performance**: Use Supabase RPCs or optimized queries for heavy operations; consider caching for read-heavy storefront pages.
- **Localization**: Keep future support for multiple currencies/languages in mind when designing schema (e.g., price tables including currency code).
- **Testing Strategy**: Maintain unit/integration coverage throughout phases; integrate with CI.
- **Release Management**: Tag releases at each phase, document release notes, and maintain rollback scripts.

---

## Tracking & Governance

- Create Kanban board (e.g., Linear/Jira) mapping tasks above.
- Require code reviews & QA sign-off per phase.
- Hold milestone demos at phase completion.
- Update this plan as tasks are completed or scope changes.

