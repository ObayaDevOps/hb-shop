import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Box, Flex, HStack, Link, Spacer, Button, Text, Badge
} from '@chakra-ui/react'
import { getPublicSupabaseClient } from '@/lib/supabaseClient'

export default function AdminNavBar() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const isOwner = role === 'owner'

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const supa = getPublicSupabaseClient()
        const { data: { session } } = await supa.auth.getSession()
        if (!mounted || !session) return
        setEmail(session.user?.email || '')
        // Get role/approval
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
      } catch {}
    }
    run()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    const supa = getPublicSupabaseClient()
    try { await supa.auth.signOut() } catch {}
    try { await fetch('/api/auth/clear-cookie', { method: 'POST' }) } catch {}
    const redirect = encodeURIComponent(router.asPath || '/admin/login')
    router.replace(`/admin/login?redirect=${redirect}`)
  }

  const linkStyle = {
    px: 3,
    py: 2,
    borderRadius: 'md',
    _hover: { bg: 'gray.100' },
    fontWeight: 500,
  }

  return (
    <Box as="header" borderBottomWidth="1px" bg="white">
      <Flex maxW="6xl" mx="auto" p={3} align="center">
        <HStack spacing={4}>
          <Link as={NextLink} href="/admin" {...linkStyle}>Admin</Link>
          <Link as={NextLink} href="/admin/inventory" {...linkStyle}>Inventory</Link>
          <Link as={NextLink} href="/admin/sales-report" {...linkStyle}>Sales Report</Link>
          {isOwner && (
            <Link as={NextLink} href="/admin/access" {...linkStyle}>Access</Link>
          )}
        </HStack>
        <Spacer />
        <HStack spacing={3}>
          {email ? (
            <>
              <Badge colorScheme={isOwner ? 'purple' : 'teal'}>{role || 'admin'}</Badge>
              <Text fontSize="sm" color="gray.700">{email}</Text>
              <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Text fontSize="sm" color="gray.500">Not signed in</Text>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}

