import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function wantsHtml(req) {
  const accept = req.headers.get('accept') || ''
  return accept.includes('text/html')
}

function redirectToLogin(req) {
  const url = new URL(req.url)
  const login = new URL('/admin/login', url.origin)
  login.searchParams.set('redirect', url.pathname + url.search)
  return NextResponse.redirect(login, { status: 307 })
}

function htmlForbidden(req) {
  // For browser navigations to protected APIs, send to login
  return redirectToLogin(req)
}

function jsonUnauthorized(message = 'Unauthorized') {
  return new NextResponse(JSON.stringify({ message }), {
    status: 401,
    headers: { 'content-type': 'application/json' }
  })
}

function jsonForbidden(message = 'Forbidden') {
  return new NextResponse(JSON.stringify({ message }), {
    status: 403,
    headers: { 'content-type': 'application/json' }
  })
}

async function getUserFromAccessToken(accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { error: new Error('Supabase env missing') }
  const pub = createClient(url, anon)
  return await pub.auth.getUser(accessToken)
}

async function isApprovedUser(user) {
  // 1) Owner bootstrap via env allowlist
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const email = (user?.email || '').toLowerCase()
  if (email && allow.includes(email)) return { ok: true, role: 'admin' }

  // 2) user_roles lookup via service role
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return { ok: false }
  try {
    const srv = createClient(url, service, { auth: { persistSession: false } })
    const { data, error } = await srv
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    if (data?.role === 'owner' || data?.role === 'admin') return { ok: true, role: data.role }
    // Fallback: allow by email match if row stored by email
    const { data: byEmail } = await srv
      .from('user_roles')
      .select('role')
      .eq('email', email)
      .maybeSingle()
    if (byEmail?.role === 'owner' || byEmail?.role === 'admin') return { ok: true, role: byEmail.role }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export async function middleware(req) {
  const { pathname } = new URL(req.url)
  const isAdmin = pathname.startsWith('/admin')
  const isApi = pathname.startsWith('/api')
  if (!isAdmin && !isApi) return NextResponse.next()

  // Read Supabase access token from cookie or Authorization header
  const cookieToken = req.cookies.get('sb-access-token')?.value || req.cookies.get('sb:token')?.value || null
  const authHeader = req.headers.get('authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const accessToken = bearer || cookieToken

  if (!accessToken) {
    // For admin pages, always redirect to login
    if (isAdmin) return redirectToLogin(req)
    // For APIs, return JSON 401
    return jsonUnauthorized()
  }

  const { data: userData, error: userErr } = await getUserFromAccessToken(accessToken)
  if (userErr || !userData?.user) {
    if (isAdmin) return redirectToLogin(req)
    return jsonUnauthorized()
  }

  const approval = await isApprovedUser(userData.user)
  if (!approval.ok) {
    // Not approved
    if (isAdmin) return NextResponse.redirect(new URL('/admin/pending', req.url))
    return jsonForbidden()
  }

  // Approved
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
}
