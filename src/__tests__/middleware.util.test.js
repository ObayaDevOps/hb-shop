import { describe, it, expect } from 'vitest'
import { isAdminPath } from '@/server/utils/adminMiddleware'

describe('admin middleware utils', () => {
  it('detects admin paths', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/')).toBe(true)
    expect(isAdminPath('/admin/inventory')).toBe(true)
    expect(isAdminPath('/admin/sales-report')).toBe(true)
    expect(isAdminPath('/')).toBe(false)
    expect(isAdminPath('/api/admin/inventory')).toBe(false)
  })
})

