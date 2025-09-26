import { createClient } from '@supabase/supabase-js'

async function getUserFromCookies(ctx) {
  const req = ctx?.req
  if (!req) return { user: null }
  const cookies = req.cookies || {}
  const token = cookies['sb-access-token'] || cookies['sb:token'] || null
  if (!token) return { user: null }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { user: null }
  const pub = createClient(url, anon)
  const { data, error } = await pub.auth.getUser(token)
  if (error) return { user: null }
  return { user: data?.user || null }
}

async function isApproved(user) {
  if (!user) return false
  const email = (user.email || '').toLowerCase()
  // allowlist via env
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (email && allow.includes(email)) return true
  // check user_roles via service role
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
    if (data?.role === 'owner' || data?.role === 'admin') return true
    const { data: byEmail } = await srv
      .from('user_roles')
      .select('role')
      .eq('email', email)
      .maybeSingle()
    if (byEmail?.role === 'owner' || byEmail?.role === 'admin') return true
    return false
  } catch {
    return false
  }
}

export async function requireAdminPage(ctx) {
  const { req, res, resolvedUrl } = ctx
  const { user } = await getUserFromCookies(ctx)
  const redirectTo = (path) => ({
    redirect: {
      destination: `${path}?redirect=${encodeURIComponent(resolvedUrl || '/admin')}`,
      permanent: false
    }
  })

  if (!user) return redirectTo('/admin/login')
  const ok = await isApproved(user)
  if (!ok) return { redirect: { destination: '/admin/pending', permanent: false } }
  return { props: {} }
}

