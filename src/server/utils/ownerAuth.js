import { createClient } from '@supabase/supabase-js'

export async function getUserFromRequest(req) {
  const authHeader = req?.headers?.authorization || ''
  const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const accessToken = bearer || req?.cookies?.['sb-access-token'] || req?.cookies?.['sb:token'] || null
  if (!accessToken) return { user: null }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const pub = createClient(url, anon)
  const { data, error } = await pub.auth.getUser(accessToken)
  if (error) return { user: null }
  return { user: data?.user || null }
}

export async function requireOwner(req) {
  const { user } = await getUserFromRequest(req)
  if (!user) return { ok: false, status: 401, body: { message: 'Unauthorized' } }
  const email = (user.email || '').toLowerCase()
  const ownerEnv = (process.env.OWNER_EMAIL || '').toLowerCase()
  if (ownerEnv && email === ownerEnv) return { ok: true, user, role: 'owner' }

  // Check user_roles for owner role
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    const srv = createClient(url, service, { auth: { persistSession: false } })
    const { data, error } = await srv
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    if (data?.role === 'owner') return { ok: true, user, role: 'owner' }
    return { ok: false, status: 403, body: { message: 'Forbidden' } }
  } catch {
    return { ok: false, status: 403, body: { message: 'Forbidden' } }
  }
}

