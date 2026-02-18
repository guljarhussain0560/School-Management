import { describe, it, expect, vi } from 'vitest'
import { GET } from '../route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe('/api/health Route Handler', () => {
  it('returns 200 with operational service status and uptime', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '1': 1 }])

    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.status).toBe('healthy')
    expect(data.version).toBe('1.0.0')
    expect(data.services.api).toBe('operational')
    expect(data.services.database.status).toBe('healthy')
    expect(data.timestamp).toBeDefined()
    expect(data.uptime).toBeDefined()
  })

  it('handles database disconnection gracefully without crashing', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection timeout'))

    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.services.database.status).toBe('unreachable')
  })
})
