import Head from 'next/head'
import { Box, Heading, Text, Stack, Badge, Code, Divider } from '@chakra-ui/react'
import { getPublicSupabaseClient } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import AdminNavBar from '@/components/Admin/AdminNavBar'

export default function AdminHome() {
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const supa = getPublicSupabaseClient()
        const { data: { session } } = await supa.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setProfile({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata || {},
          })
          try {
            const res = await fetch('/api/admin/access/status', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            })
            if (res.ok) {
              const data = await res.json()
              if (!mounted) return
              setRole(data.role || '')
            }
          } catch {}
        }
      } catch {}
    }
    run()
    return () => { mounted = false }
  }, [])

  return (
    <Box>
      <Head>
        <title>Admin | Overview</title>
      </Head>
      <AdminNavBar />
      <Box maxW="6xl" mx="auto" p={8}>
        <Heading size="lg" mb={4}>Welcome to Admin</Heading>
        <Text mb={6}>View your profile and navigate to administrative tools.</Text>
        <Stack spacing={3}>
          <Heading size="md">Your Profile</Heading>
          {profile ? (
            <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Text><strong>Email:</strong> {profile.email}</Text>
              <Text><strong>User ID:</strong> <Code>{profile.id}</Code></Text>
              <Text mt={2}><strong>Role:</strong> <Badge colorScheme={role === 'owner' ? 'purple' : 'teal'}>{role || 'admin'}</Badge></Text>
              {profile.user_metadata?.full_name && (
                <Text mt={2}><strong>Name:</strong> {profile.user_metadata.full_name}</Text>
              )}
            </Box>
          ) : (
            <Text color="gray.600">Loading profile…</Text>
          )}
          <Divider my={6} />
          <Text color="gray.600">Use the navigation bar to access Inventory, Sales Report, and (if you’re the owner) Access Control.</Text>
        </Stack>
      </Box>
    </Box>
  )
}

export { requireAdminPage as getServerSideProps } from '@/server/utils/pageGuard'

