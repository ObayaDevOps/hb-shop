import { requireOwner } from '@/server/utils/ownerAuth'
import { approveEmail } from '@/server/repositories/access'

export default async function handler(req, res) {
  const auth = await requireOwner(req)
  if (!auth.ok) return res.status(auth.status).json(auth.body)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
  const { email, user_id: userId, role } = req.body || {}
  if (!email && !userId) return res.status(400).json({ message: 'email or user_id required' })
  try {
    const { data, error } = await approveEmail({ email, userId, role: role || 'admin' })
    if (error) return res.status(500).json({ message: 'Failed to approve', details: error.message })
    return res.status(200).json({ ok: true, item: data })
  } catch (e) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

