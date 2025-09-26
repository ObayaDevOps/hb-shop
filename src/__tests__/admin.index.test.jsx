import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminHome from '@/pages/admin/index'

vi.mock('@/lib/supabaseClient', () => ({
  getPublicSupabaseClient: () => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: { access_token: 'tok', user: { email: 'admin@example.com', id: 'u1', user_metadata: { full_name: 'Admin User' } } } } })),
    },
  })
}))

describe('Admin landing page', () => {
  it('renders profile info and role', async () => {
    global.fetch = vi.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/api/admin/access/status')) {
        return new Response(JSON.stringify({ approved: true, role: 'admin' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })

    render(<AdminHome />)
    expect(await screen.findByRole('heading', { name: /Your Profile/i })).toBeInTheDocument()
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument()
    expect(await screen.findByText(/admin/i)).toBeInTheDocument()
    expect(await screen.findByText('Admin User')).toBeInTheDocument()
  })
})
