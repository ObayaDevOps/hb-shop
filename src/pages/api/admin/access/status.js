import { createClient } from '@supabase/supabase-js'
import { getApprovalForEmailOrUser } from '@/server/repositories/access'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const auth = req.headers?.authorization || ''
    const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : null
    const token = bearer || req.cookies?.['sb-access-token'] || req.cookies?.['sb:token']
    if (!token) return res.status(200).json({ approved: false, pending: false, role: null })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const pub = createClient(url, anon)
    const { data, error } = await pub.auth.getUser(token)
    if (error || !data?.user) return res.status(200).json({ approved: false, pending: false, role: null })

    const email = (data.user.email || '').toLowerCase()
    const approval = await getApprovalForEmailOrUser({ userId: data.user.id, email })
    if (approval.approved) return res.status(200).json({ approved: true, pending: false, role: approval.role })

    // Not approved — check pending table exists and if request is recorded is optional here
    return res.status(200).json({ approved: false, pending: true, role: null })
  } catch (e) {
    return res.status(200).json({ approved: false, pending: false, role: null })
  }
}

