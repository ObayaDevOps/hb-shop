# Sanity → Commerce Hub Product Migration Plan

This plan covers migrating product data from Sanity into the new Supabase-backed Commerce Hub while retaining Sanity for marketing pages and editorial content. The goal is a repeatable, low-downtime process that supports existing clients and future onboardings.

## Guiding Principles
- **Single source of truth for commerce**: Products, variants, inventory, pricing, media metadata live in Supabase.
- **Hybrid CMS**: Sanity remains responsible for marketing/landing content; product references in Sanity are deprecated post-cutover.
- **Idempotent + auditable**: Migration scripts can be rerun safely and surface diffs between systems.
- **Minimal disruption**: Keep storefront queries dual-wired until parity checks pass.

## Target Data Model (Supabase)
- `categories`: hierarchy of product groupings.
- `products`: base product record (title, description, slug, status, SEO fields, default_variant_id).
- `product_options` / `product_option_values`: definable variant dimensions (Size, Color, etc.).
- `product_variants`: one or more purchasable variants with SKU, option values, pricing, tax codes.
- `inventory_items`: stock levels per variant (extensible to locations).
- `product_media`: ordered gallery referencing Vercel Blob URLs, alt text, and primary flag.
- Optional future tables: `collections`, `metafields`, `locations`.

## Migration Waves
1. **Schema + plumbing**
   - Apply Supabase migrations to create the target tables and seed reference data (categories, options).
   - Ship read/write services (API endpoints / server actions) behind admin auth.

2. **Data extraction & staging**
   - Use GROQ to export Sanity `product` documents and related `category` documents.
   - For each product, fetch current Supabase inventory data (price, quantity) already captured in `inventory` table (`src/lib/db.js`).
   - Download Sanity image assets to temporary storage.

3. **Transform**
   - Map Sanity fields → new schema (e.g., `isPopular` → tag/collection flag, `slug.current` → product handle).
   - Create default variant records when products have no variant structure.
   - Normalize categories (create missing categories in Supabase, maintain slug stability).
   - Upload images to Vercel Blob; collect blob URLs + metadata for `product_media`.

4. **Load**
   - Upsert categories, products, options, variants, inventory, media using transactional batches.
   - Record source IDs (Sanity document IDs) in a `_legacy_ref` column or JSONB audit field for traceability.

5. **Verification**
   - Build comparison report (counts, price/quantity mismatches, orphaned records) exposed in admin dashboard.
   - Run targeted QA in staging: ensure storefront renders solely from Supabase data; confirm Sanity marketing pages unaffected.

6. **Cutover**
   - Flip storefront queries (`src/pages/index.js`, `src/pages/products/[slug].js`) to Supabase services.
   - Remove Sanity product dependencies and webhooks (`src/pages/api/sync/inventory.js`).
   - Communicate switch to merch team; archive or flag deprecated Sanity product content.

## Tooling Options
- **Primary**: Node migration script (TypeScript) run via `npm run migrate:products`.
  - Pros: deterministic, easy to test, automatable in CI/CD.
- **Secondary**: Guided migration UI within Commerce Hub (fetch from Sanity, preview mappings, confirm import).
  - Pros: empowers non-technical operators; reusable for future clients.
- **Contingency**: Partner ETL (Airbyte/Singer) if external teams need managed sync pipelines.

## Rollback & Safety Nets
- Keep Sanity dataset untouched; ability to revert storefront to Sanity feed if critical issues arise.
- Store migration logs (success/failure per product) in Supabase table `migration_logs` with timestamps and operators.
- Implement dry-run flag that simulates load without committing.

## Post-Migration Tasks
- Update documentation for merch ops (how to manage products, upload media, adjust inventory).
- Monitor inventory discrepancies via scheduled job comparing orders vs. stock.
- Plan for archival of legacy `inventory` columns/functions once new schema stabilizes.

## Timeline Snapshot
1. Week 1: finalize schema + services, build migration tooling.
2. Week 2: migrate staging data, QA storefront + admin flows.
3. Week 3: run production migration window, flip storefront, monitor.

Align all stakeholders before execution and schedule migration during low-traffic windows.
