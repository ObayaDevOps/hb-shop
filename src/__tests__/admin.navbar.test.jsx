import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import AdminNavBar from '@/components/Admin/AdminNavBar'

vi.mock('@/lib/supabaseClient', () => ({
  getPublicSupabaseClient: () => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: { access_token: 'tok', user: { email: 'admin@example.com', id: 'u1' } } } })),
      signOut: vi.fn(async () => {}),
    },
  })
}))

describe('AdminNavBar', () => {
  beforeEach(() => {
    // default MSW handlers from setup should be present; override as needed per test using fetch mock
  })

  it('shows Inventory and Sales links and user email; hides Access for non-owner', async () => {
    // mock fetch for access status
    global.fetch = vi.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/api/admin/access/status')) {
        return new Response(JSON.stringify({ approved: true, role: 'admin' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })

    render(<AdminNavBar />)
    await screen.findByText('admin@example.com')
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Sales Report')).toBeInTheDocument()
    expect(screen.queryByText('Access')).not.toBeInTheDocument()
  })

  it('shows Access link for owner role', async () => {
    global.fetch = vi.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/api/admin/access/status')) {
        return new Response(JSON.stringify({ approved: true, role: 'owner' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })

    render(<AdminNavBar />)
    await screen.findByText('admin@example.com')
    expect(screen.getByText('Access')).toBeInTheDocument()
  })

  it('logout triggers signOut, clears cookie and redirects to login with redirect param', async () => {
    const fetchMock = vi.fn(async (url, init) => {
      if (typeof url === 'string' && url.includes('/api/admin/access/status')) {
        return new Response(JSON.stringify({ approved: true, role: 'admin' }), { status: 200 })
      }
      if (typeof url === 'string' && url.includes('/api/auth/clear-cookie')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })
    global.fetch = fetchMock

    render(<AdminNavBar />)
    await screen.findByText('admin@example.com')

    const logout = await screen.findByRole('button', { name: /logout/i })
    await userEvent.click(logout)

    // clear-cookie endpoint called
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/clear-cookie', { method: 'POST' })
    })

    // redirected via router.replace('/admin/login?redirect=%2F')
    const router = useRouter()
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalled()
      expect(router.replace).toHaveBeenCalledWith('/admin/login?redirect=%2F')
    })
  })
})
