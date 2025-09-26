import { NextResponse, NextRequest } from 'next/server'
import { isAdminPath } from '@/server/utils/adminMiddleware'

export function middleware(req: NextRequest) {
  // Currently a passthrough; cookie sync happens via /api/auth/sync-cookie after login.
  // This ensures the middleware runs on admin routes (for future enhancements) without interfering.
  const { pathname } = req.nextUrl
  if (!isAdminPath(pathname)) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

