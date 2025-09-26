import { getServerSupabaseClient } from '@/lib/supabaseClient'

export async function getApprovalForEmailOrUser({ userId, email }) {
  const supa = getServerSupabaseClient()
  // First by user_id
  if (userId) {
    const { data, error } = await supa
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
    if (!error && (data?.role === 'owner' || data?.role === 'admin')) return { approved: true, role: data.role }
  }
  // Fallback by email
  if (email) {
    const { data } = await supa
      .from('user_roles')
      .select('role')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    if (data?.role === 'owner' || data?.role === 'admin') return { approved: true, role: data.role }
  }
  // Env allowlist
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (email && allow.includes(email.toLowerCase())) return { approved: true, role: 'admin' }
  return { approved: false, role: null }
}

export async function upsertPendingRequest({ userId, email, provider = 'google', metadata = {} }) {
  const supa = getServerSupabaseClient()
  const { data, error } = await supa
    .from('admin_signup_requests')
    .upsert({
      email: email?.toLowerCase(),
      user_id: userId || null,
      provider,
      status: 'pending',
      metadata
    }, { onConflict: 'email' })
    .select()
    .maybeSingle()
  return { data, error }
}

export async function listPendingRequests() {
  const supa = getServerSupabaseClient()
  return await supa
    .from('admin_signup_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
}

export async function listApprovedAdmins() {
  const supa = getServerSupabaseClient()
  return await supa
    .from('user_roles')
    .select('user_id,email,role,created_at,updated_at')
    .in('role', ['owner', 'admin'])
    .order('created_at', { ascending: true })
}

export async function approveEmail({ email, userId, role = 'admin' }) {
  const supa = getServerSupabaseClient()
  const lower = email?.toLowerCase()
  const { data, error } = await supa
    .from('user_roles')
    .upsert({ email: lower, user_id: userId || null, role }, { onConflict: 'email' })
    .select()
    .maybeSingle()
  if (error) return { data: null, error }
  await supa
    .from('admin_signup_requests')
    .update({ status: 'approved' })
    .eq('email', lower)
  return { data, error: null }
}

export async function revokeAccess({ email, userId }) {
  const supa = getServerSupabaseClient()
  if (userId) {
    await supa.from('user_roles').delete().eq('user_id', userId)
  }
  if (email) {
    await supa.from('user_roles').delete().eq('email', email.toLowerCase())
  }
  return { data: { ok: true }, error: null }
}

