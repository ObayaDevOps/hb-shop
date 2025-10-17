// src/server/repositories/catalog.js
import { getServerSupabaseClient } from '@/lib/supabaseClient'

const TABLES = {
  categories: 'categories',
  products: 'products',
  productOptions: 'product_options',
  productOptionValues: 'product_option_values',
  productVariants: 'product_variants',
  inventoryItems: 'inventory_items',
  productMedia: 'product_media',
  collections: 'collections',
  collectionProducts: 'collection_products',
}

function raise(error, context) {
  const err = new Error(context)
  err.cause = error
  throw err
}

export async function listCategories({ includeInactive = false } = {}) {
  const supabase = getServerSupabaseClient()
  let query = supabase
    .from(TABLES.categories)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) raise(error, 'Failed to fetch categories')
  return data || []
}

export async function upsertCategory(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.categories)
    .upsert(payload, { onConflict: 'slug' })
    .select()
    .single()
  if (error) raise(error, 'Failed to upsert category')
  return data
}

export async function deleteCategory(id) {
  const supabase = getServerSupabaseClient()
  const { error } = await supabase
    .from(TABLES.categories)
    .delete()
    .eq('id', id)
  if (error) raise(error, 'Failed to delete category')
  return { ok: true }
}

export async function createProduct(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.products)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to create product')
  return data
}

export async function updateProduct(id, updates) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.products)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) raise(error, 'Failed to update product')
  return data
}

export async function getProductById(id) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.products)
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) raise(error, 'Failed to fetch product')
  return data
}

export async function listProducts({ status, categoryId } = {}) {
  const supabase = getServerSupabaseClient()
  let query = supabase
    .from(TABLES.products)
    .select('*')
    .order('updated_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  const { data, error } = await query
  if (error) raise(error, 'Failed to list products')
  return data || []
}

export async function createProductOption(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productOptions)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to create product option')
  return data
}

export async function createProductOptionValue(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productOptionValues)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to create product option value')
  return data
}

export async function deleteProductOption(optionId) {
  const supabase = getServerSupabaseClient()
  const { error } = await supabase
    .from(TABLES.productOptions)
    .delete()
    .eq('id', optionId)
  if (error) raise(error, 'Failed to delete product option')
  return { ok: true }
}

export async function createProductVariant(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productVariants)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to create product variant')
  return data
}

export async function updateProductVariant(id, updates) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productVariants)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) raise(error, 'Failed to update product variant')
  return data
}

export async function listVariantsByProduct(productId) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productVariants)
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })
  if (error) raise(error, 'Failed to list product variants')
  return data || []
}

export async function upsertInventoryItem(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.inventoryItems)
    .upsert(payload, { onConflict: 'variant_id' })
    .select()
    .single()
  if (error) raise(error, 'Failed to upsert inventory item')
  return data
}

export async function listInventoryByVariantIds(variantIds = []) {
  if (!variantIds.length) return []
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.inventoryItems)
    .select('*')
    .in('variant_id', variantIds)
  if (error) raise(error, 'Failed to fetch inventory records')
  return data || []
}

export async function addProductMedia(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productMedia)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to add product media')
  return data
}

export async function updateProductMedia(id, updates) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.productMedia)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) raise(error, 'Failed to update product media')
  return data
}

export async function deleteProductMedia(id) {
  const supabase = getServerSupabaseClient()
  const { error } = await supabase
    .from(TABLES.productMedia)
    .delete()
    .eq('id', id)
  if (error) raise(error, 'Failed to delete product media')
  return { ok: true }
}

export async function createCollection(payload) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.collections)
    .insert(payload)
    .select()
    .single()
  if (error) raise(error, 'Failed to create collection')
  return data
}

export async function updateCollection(id, updates) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.collections)
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) raise(error, 'Failed to update collection')
  return data
}

export async function attachProductToCollection(collectionId, productId, payload = {}) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.collectionProducts)
    .upsert({ collection_id: collectionId, product_id: productId, ...payload })
    .select()
    .single()
  if (error) raise(error, 'Failed to attach product to collection')
  return data
}

export async function detachProductFromCollection(collectionId, productId) {
  const supabase = getServerSupabaseClient()
  const { error } = await supabase
    .from(TABLES.collectionProducts)
    .delete()
    .match({ collection_id: collectionId, product_id: productId })
  if (error) raise(error, 'Failed to detach product from collection')
  return { ok: true }
}

export async function listCollections({ includeInactive = false } = {}) {
  const supabase = getServerSupabaseClient()
  let query = supabase
    .from(TABLES.collections)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) raise(error, 'Failed to list collections')
  return data || []
}

export async function listCollectionProducts(collectionId) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLES.collectionProducts)
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true })
  if (error) raise(error, 'Failed to list collection products')
  return data || []
}
