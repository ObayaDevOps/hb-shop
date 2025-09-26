import { Box, Heading, Text, Button } from '@chakra-ui/react'
import Head from 'next/head'
import { getPublicSupabaseClient } from '@/lib/supabaseClient'

export default function PendingPage() {
  const handleLogout = async () => {
    const supa = getPublicSupabaseClient()
    await supa.auth.signOut()
    try { await fetch('/api/auth/clear-cookie', { method: 'POST' }) } catch {}
    window.location.replace('/admin/login')
  }

  return (
    <Box p={8} maxW="lg" mx="auto">
      <Head>
        <title>Access Pending | Admin</title>
      </Head>
      <Heading size="lg" mb={4}>Your access is pending approval</Heading>
      <Text mb={4}>We’ve notified the site owner. You’ll be able to access the admin area once approved.</Text>
      <Button onClick={handleLogout} colorScheme="gray">Back to Login</Button>
    </Box>
  )
}
