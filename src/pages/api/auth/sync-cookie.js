// pages/api/auth/sync-cookie.js
// Syncs the Supabase access token into HTTP-only cookies so SSR can read it.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const auth = req.headers?.authorization || ''
    const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : null
    const token = bearer || req.body?.token
    if (!token) return res.status(400).json({ message: 'Missing access token' })

    const prod = /^https:/i.test(process.env.NEXT_PUBLIC_APP_BASE_URL || '') || process.env.NODE_ENV === 'production'
    const cookieBase = {
      Path: '/',
      SameSite: 'Lax',
      HttpOnly: true,
      Secure: prod,
      // Max-Age: let the browser/session manage expiry; optionally set short TTL here
    }

    const serialize = (name, value, opts = {}) => {
      const parts = [`${name}=${encodeURIComponent(value)}`]
      const o = { ...cookieBase, ...opts }
      if (o.MaxAge) parts.push(`Max-Age=${o.MaxAge}`)
      if (o.Domain) parts.push(`Domain=${o.Domain}`)
      if (o.Path) parts.push(`Path=${o.Path}`)
      parts.push(`SameSite=${o.SameSite || 'Lax'}`)
      if (o.HttpOnly) parts.push('HttpOnly')
      if (o.Secure) parts.push('Secure')
      return parts.join('; ')
    }

    // Set both cookie names our SSR guard and API check look for
    res.setHeader('Set-Cookie', [
      serialize('sb-access-token', token),
      serialize('sb:token', token),
    ])

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

