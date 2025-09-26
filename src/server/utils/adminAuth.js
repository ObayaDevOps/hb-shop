// src/server/utils/adminAuth.js
import { createClient } from '@supabase/supabase-js'
import { getServerSupabaseClient } from '@/lib/supabaseClient'

function extractBearer(req) {
  const h = req?.headers?.authorization || ''
  if (typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7)
  return null
}

function tokenFromCookies(req) {
  try {
    // Supabase auth-helpers set sb-access-token cookie
    const cookies = req?.cookies || {}
    return cookies['sb-access-token'] || cookies['sb:token'] || null
  } catch {
    return null
  }
}

export async function requireAdminAuth(req) {
  if (process.env.NODE_ENV === 'test') return { ok: true, source: 'test-bypass' }
  // 1) Backdoor for non-prod/dev: header token
  const expected = process.env.ADMIN_TOKEN
  const headerToken = req?.headers?.['x-admin-token']
  const bearer = extractBearer(req)
  if (expected && (headerToken === expected || bearer === expected)) {
    return { ok: true, source: 'token' }
  }

  // 2) Supabase access token from Authorization or cookies
  const accessToken = bearer || tokenFromCookies(req)
  if (!accessToken) return { ok: false, status: 401, body: { message: 'Unauthorized' } }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { ok: false, status: 500, body: { message: 'Server auth misconfigured' } }

  // Public client to resolve the user from access token
  const pub = createClient(url, anon)
  const { data: userData, error: userErr } = await pub.auth.getUser(accessToken)
  if (userErr || !userData?.user) return { ok: false, status: 401, body: { message: 'Unauthorized' } }

  const user = userData.user

  // 3) Simple email allowlist via env
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (allow.length && allow.includes((user.email || '').toLowerCase())) return { ok: true, user, source: 'email-allowlist' }

  // 4) Role lookup from DB (user_roles table)
  try {
    const supa = getServerSupabaseClient()
    const { data, error } = await supa
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    if (data?.role === 'admin') return { ok: true, user, source: 'db-role' }
    return { ok: false, status: 403, body: { message: 'Forbidden' } }
  } catch (e) {
    // If roles table missing, fail closed unless allowlist or token matched
    return { ok: false, status: 403, body: { message: 'Forbidden' } }
  }
}
