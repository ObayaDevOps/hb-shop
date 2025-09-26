// pages/api/auth/clear-cookie.js
// Clears Supabase auth cookies used for SSR.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
  const prod = /^https:/i.test(process.env.NEXT_PUBLIC_APP_BASE_URL || '') || process.env.NODE_ENV === 'production'
  const base = `Path=/; SameSite=Lax; ${prod ? 'Secure; ' : ''}HttpOnly; Max-Age=0`
  res.setHeader('Set-Cookie', [
    `sb-access-token=; ${base}`,
    `sb:token=; ${base}`,
  ])
  return res.status(200).json({ ok: true })
}

