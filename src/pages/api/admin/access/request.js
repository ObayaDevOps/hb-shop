import { createClient } from '@supabase/supabase-js'
import { upsertPendingRequest, getApprovalForEmailOrUser } from '@/server/repositories/access'
import { sendOwnerSignupNotification } from '@/server/utils/mailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
  try {
    const auth = req.headers?.authorization || ''
    const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : null
    const token = bearer || req.cookies?.['sb-access-token'] || req.cookies?.['sb:token']
    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const pub = createClient(url, anon)
    const { data, error } = await pub.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ message: 'Unauthorized' })

    const user = data.user
    const email = (user.email || '').toLowerCase()
    const approval = await getApprovalForEmailOrUser({ userId: user.id, email })
    if (approval.approved) return res.status(200).json({ message: 'Already approved' })

    const { error: upsertError } = await upsertPendingRequest({ userId: user.id, email, provider: 'google', metadata: {} })
    if (upsertError) return res.status(500).json({ message: 'Failed to create pending request' })

    // Notify owner
    try {
      await sendOwnerSignupNotification({ requesterEmail: email })
    } catch (_) {}

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

