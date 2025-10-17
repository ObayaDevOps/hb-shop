-- Commerce Hub schema for unified product catalog

-- Ensure UUID generator available
create extension if not exists pgcrypto;

-- Timestamps helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_categories_slug on public.categories (lower(slug));
create index if not exists idx_categories_parent_id on public.categories (parent_id);

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  handle text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  seo_title text,
  seo_description text,
  tags text[] not null default array[]::text[],
  vendor text,
  product_type text,
  default_variant_id uuid,
  published_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_products_handle on public.products (lower(handle));
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_category on public.products (category_id);

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Product Options
create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_options_product on public.product_options (product_id, sort_order);

create trigger set_product_options_updated_at
before update on public.product_options
for each row execute function public.set_updated_at();

-- Product Option Values
create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_option_values_unique on public.product_option_values (option_id, lower(value));
create index if not exists idx_option_values_option on public.product_option_values (option_id, sort_order);

create trigger set_option_values_updated_at
before update on public.product_option_values
for each row execute function public.set_updated_at();

-- Product Variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text,
  sku text,
  barcode text,
  price_amount numeric(12,2) not null default 0,
  currency_code text not null default 'UGX' check (char_length(currency_code) = 3),
  compare_at_amount numeric(12,2),
  cost_amount numeric(12,2),
  option_values jsonb not null default '[]'::jsonb,
  requires_shipping boolean not null default true,
  is_active boolean not null default true,
  weight_grams numeric(12,3),
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_variants_sku on public.product_variants (lower(sku)) where sku is not null;
create index if not exists idx_variants_product on public.product_variants (product_id);
create index if not exists idx_variants_active on public.product_variants (product_id, is_active);

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

-- Inventory Items (single-location baseline)
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  location_id uuid,
  quantity_on_hand integer not null default 0,
  quantity_reserved integer not null default 0,
  low_stock_threshold integer,
  allow_backorder boolean not null default false,
  tracked boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_inventory_variant_single on public.inventory_items (variant_id) where location_id is null;
create index if not exists idx_inventory_location on public.inventory_items (location_id);

create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

-- Product Media
create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  blob_url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_media_product on public.product_media (product_id, sort_order);
create index if not exists idx_product_media_variant on public.product_media (variant_id);

create trigger set_product_media_updated_at
before update on public.product_media
for each row execute function public.set_updated_at();

-- Collections (optional merchandising)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  handle text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  legacy_ref jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_collections_handle on public.collections (lower(handle));

create trigger set_collections_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create index if not exists idx_collection_products_product on public.collection_products (product_id);

create trigger set_collection_products_updated_at
before update on public.collection_products
for each row execute function public.set_updated_at();

-- Default variant FK (added after variants table exists)
alter table public.products
  add constraint products_default_variant_fk
  foreign key (default_variant_id) references public.product_variants(id) on delete set null;
