# Commerce Hub (Supabase-First) — High-Level Plan

## Vision
Deliver a single “Commerce Hub” admin experience where merchandisers create and manage products, media, and inventory directly on Supabase, while Sanity continues powering marketing content. The hub should feel familiar to Shopify users and be extensible for variants, collections, and future sales channels.

## Pillars
1. **Unified Catalog**
   - Supabase schema for categories, products, product options/variants, inventory, and media.
   - APIs/services enabling CRUD with validation, versioning, and audit trails.
2. **Rich Admin UX**
   - A single Commerce Hub page with tabs for Overview, Media, Pricing & Inventory, Organization, and Variants.
   - Drag-and-drop media uploader integrated with Vercel Blob storage (thumbnail previews, reorder, alt text editing).
   - Inline category creation and tagging to support hybrid marketing flows.
3. **Hybrid Content Strategy**
   - Sanity remains the source for landing pages, blog, and marketing blocks.
   - Storefront components read product data exclusively from Supabase (post-migration) while still composable with Sanity-driven layouts.
4. **Migration & Safety**
   - Documented migration process (see `sanity-supabase-product-migration.md`) with dry-runs, audit logs, and rollback procedures.
   - Temporary dual-read capability during validation window.
5. **Extensibility**
   - Data model anticipates product variants, multiple price lists, inventory locations, metafields.
   - Modular service layer to add channels (POS, marketplaces) without reshaping core tables.

## Phased Roadmap
- **Phase 0: Foundations**
  - Finalize Supabase migrations & Prisma-type definitions.
  - Implement auth guard, rate limiting, and logging for commerce APIs.

- **Phase 1: Admin MVP**
  - Build Commerce Hub UI (Chakra + Next) with CRUD flows for categories and simple products (single variant).
  - Integrate Vercel Blob uploads, preview carousel, reorder.
  - Replace storefront read paths with Supabase fetchers behind feature flag.

- **Phase 2: Variants & Inventory**
  - Add product options, variant matrix management, SKU enforcement.
  - Bulk inventory adjustment screen + CSV import/export hooks.
  - Notifications for low stock and unpublished media.

- **Phase 3: Migration & Cutover**
  - Execute migration plan in staging; fix discrepancies.
  - Run production migration, monitor metrics, decommission Sanity product usage.

- **Phase 4: Enhancements**
  - Collections/merchandising, scheduled launches, price lists, metafields.
  - Analytics widgets (sales, stock velocity) powered by existing Supabase RPCs.

## Success Metrics
- Merch team manages catalog end-to-end in Commerce Hub with <5% manual SQL support.
- Product page load time decreases by removing Sanity roundtrips.
- Post-cutover bug rate stays within SLA due to dual-read validation.
- Future variant/collection features can be added without schema rewrites.

## Dependencies & Risks
- Requires Supabase service-role access and Vercel Blob quota alignment.
- Ensure Sanity editors are informed about scope changes (products no longer editable there).
- Migration complexity increases if product data in Sanity diverges from Supabase inventory; invest in reconciliation tooling early.

Keep this plan updated as we deliver milestones and incorporate feedback from ops, marketing, and engineering.
