import { requireOwner } from '@/server/utils/ownerAuth'
import { listPendingRequests, listApprovedAdmins } from '@/server/repositories/access'

export default async function handler(req, res) {
  const auth = await requireOwner(req)
  if (!auth.ok) return res.status(auth.status).json(auth.body)

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const [pending, approved] = await Promise.all([
    listPendingRequests(),
    listApprovedAdmins()
  ])
  const p = pending.data || []
  const a = approved.data || []
  return res.status(200).json({ pending: p, approved: a })
}

