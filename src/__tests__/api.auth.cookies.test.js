import { describe, it, expect } from 'vitest'
import syncHandler from '@/pages/api/auth/sync-cookie'
import clearHandler from '@/pages/api/auth/clear-cookie'

const createReqRes = (method = 'POST', { headers = {}, body = {} } = {}) => {
  const req = { method, headers, body, cookies: {} }
  let statusCode = 200
  let jsonPayload
  const setHeaders = {}
  const res = {
    setHeader: (k, v) => { setHeaders[k] = v },
    status: (c) => { statusCode = c; return res },
    json: (p) => { jsonPayload = p; return res },
  }
  return { req, res, out: () => ({ statusCode, json: jsonPayload, headers: setHeaders }) }
}

describe('Auth cookie endpoints', () => {
  it('sync-cookie sets sb-access-token cookie', async () => {
    const { req, res, out } = createReqRes('POST', { headers: { authorization: 'Bearer test-token' } })
    await syncHandler(req, res)
    const result = out()
    expect(result.statusCode).toBe(200)
    const set = result.headers['Set-Cookie']
    expect(Array.isArray(set)).toBe(true)
    expect(set.join(';')).toMatch(/sb-access-token=/)
  })

  it('clear-cookie clears cookies', async () => {
    const { req, res, out } = createReqRes('POST')
    await clearHandler(req, res)
    const result = out()
    expect(result.statusCode).toBe(200)
    const set = result.headers['Set-Cookie']
    expect(Array.isArray(set)).toBe(true)
    expect(set.join(';')).toMatch(/Max-Age=0/)
  })
})

