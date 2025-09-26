import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Button, Text, Spinner, useToast } from '@chakra-ui/react'
import AdminNavBar from '@/components/Admin/AdminNavBar'
import { getPublicSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AccessDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const toast = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/access/pending')
      if (!res.ok) {
        if (res.status === 401) {
          router.replace(`/admin/login?redirect=${encodeURIComponent('/admin/access')}`)
          return
        }
        if (res.status === 403) {
          router.replace('/admin/pending')
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setPending(data.pending || [])
      setApproved(data.approved || [])
    } catch (e) {
      toast({ title: 'Error loading data', description: e.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const approve = async (email, user_id) => {
    try {
      const supa = getPublicSupabaseClient()
      const { data: { session } } = await supa.auth.getSession()
      const res = await fetch('/api/admin/access/approve', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ email, user_id })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast({ title: 'Approved', status: 'success' })
      fetchData()
    } catch (e) {
      toast({ title: 'Approve failed', description: e.message, status: 'error' })
    }
  }

  const revoke = async (email, user_id) => {
    try {
      const supa = getPublicSupabaseClient()
      const { data: { session } } = await supa.auth.getSession()
      const res = await fetch('/api/admin/access/revoke', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ email, user_id })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast({ title: 'Revoked', status: 'success' })
      fetchData()
    } catch (e) {
      toast({ title: 'Revoke failed', description: e.message, status: 'error' })
    }
  }

  return (
    <Box>
      <AdminNavBar />
      <Box p={8} maxW="6xl" mx="auto">
      <Head>
        <title>Admin Access</title>
      </Head>
      <Heading size="lg" mb={6}>Admin Access Control</Heading>
      {loading ? (
        <Box display="flex" alignItems="center"><Spinner /><Text ml={3}>Loading…</Text></Box>
      ) : (
        <Tabs colorScheme="teal">
          <TabList>
            <Tab>Pending Requests ({pending.length})</Tab>
            <Tab>Approved Admins ({approved.length})</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Email</Th>
                    <Th>User ID</Th>
                    <Th>Provider</Th>
                    <Th>Requested</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pending.map((p) => (
                    <Tr key={p.id}>
                      <Td>{p.email}</Td>
                      <Td>{p.user_id || '-'}</Td>
                      <Td>{p.provider}</Td>
                      <Td>{new Date(p.created_at).toLocaleString()}</Td>
                      <Td textAlign="right">
                        <Button colorScheme="green" size="sm" onClick={() => approve(p.email, p.user_id)}>Approve</Button>
                      </Td>
                    </Tr>
                  ))}
                  {pending.length === 0 && (
                    <Tr><Td colSpan={5}><Text>No pending requests.</Text></Td></Tr>
                  )}
                </Tbody>
              </Table>
            </TabPanel>
            <TabPanel>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Email</Th>
                    <Th>User ID</Th>
                    <Th>Role</Th>
                    <Th>Since</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {approved.map((a, i) => (
                    <Tr key={`${a.email}-${i}`}>
                      <Td>{a.email}</Td>
                      <Td>{a.user_id || '-'}</Td>
                      <Td>{a.role}</Td>
                      <Td>{new Date(a.created_at).toLocaleString()}</Td>
                      <Td textAlign="right">
                        <Button colorScheme="red" size="sm" variant="outline" onClick={() => revoke(a.email, a.user_id)}>Revoke</Button>
                      </Td>
                    </Tr>
                  ))}
                  {approved.length === 0 && (
                    <Tr><Td colSpan={5}><Text>No approved admins yet.</Text></Td></Tr>
                  )}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      </Box>
    </Box>
  )
}

export { requireAdminPage as getServerSideProps } from '@/server/utils/pageGuard'
