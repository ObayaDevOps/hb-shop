import { useEffect, useState } from 'react'
import { Box, Heading, Input, Button, FormControl, FormLabel, Text, Alert, AlertIcon, Divider } from '@chakra-ui/react'
import Head from 'next/head'
import { getPublicSupabaseClient } from '@/lib/supabaseClient'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  const handleSendLink = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const supa = getPublicSupabaseClient()
      const redirectTo = `${window.location.origin}/admin/inventory`
      const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send magic link')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const supa = getPublicSupabaseClient()
      const url = new URL(window.location.href)
      const redirect = url.searchParams.get('redirect') || '/admin'
      await supa.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirect}`
        }
      })
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    }
  }

  useEffect(() => {
    const check = async () => {
      try {
        const supa = getPublicSupabaseClient()
        const { data: { session } } = await supa.auth.getSession()
        if (!session) return
        // Ensure SSR can see the session by syncing the access token into HTTP-only cookies
        try {
          await fetch('/api/auth/sync-cookie', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({}),
          })
        } catch {}
        // Check approval status
        const res = await fetch('/api/admin/access/status', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.approved) {
          const url = new URL(window.location.href)
          const redirect = url.searchParams.get('redirect') || '/admin'
          window.location.replace(redirect)
          return
        }
        // Not approved -> create pending request, then sign out and show pending page
        await fetch('/api/admin/access/request', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({})
        }).catch(() => {})
        await supa.auth.signOut()
        try { await fetch('/api/auth/clear-cookie', { method: 'POST' }) } catch {}
        window.location.replace('/admin/pending')
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [])

  return (
    <Box p={8} maxW="md" mx="auto">
      <Head>
        <title>Admin Login | Little Kobe Japanese Market</title>
      </Head>
      <Heading size="lg" mb={4}>Admin Login</Heading>
      <Text mb={6}>Sign in with Google. If your email isn’t approved yet, we’ll notify the site owner for approval.</Text>
      <Button colorScheme="blue" onClick={handleGoogleLogin} mb={6} isDisabled={checking}>
        Continue with Google
      </Button>
      <Divider my={6} />
      <Text mb={6}>Enter your email to receive a magic sign-in link.</Text>
      {sent ? (
        <Alert status="success" mb={4}><AlertIcon/>Magic link sent. Check your inbox.</Alert>
      ) : null}
      {error ? (
        <Alert status="error" mb={4}><AlertIcon/>{error}</Alert>
      ) : null}
      <form onSubmit={handleSendLink}>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@yourdomain.com"/>
        </FormControl>
        <Button type="submit" colorScheme="teal">Send Magic Link</Button>
      </form>
    </Box>
  )
}
