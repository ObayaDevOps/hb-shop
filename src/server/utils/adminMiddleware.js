// Utility helpers for admin middleware and tests

export function isAdminPath(pathname) {
  if (typeof pathname !== 'string') return false
  return /^\/admin(\/|$)/.test(pathname)
}

