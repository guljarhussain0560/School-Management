import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    feeStructure: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Fee Structures API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthorized', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns fee structures list for school session', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const mockFees = [
      { id: 'fs-1', name: 'Annual Tuition', amount: 50000, frequency: 'ANNUAL', category: 'TUITION' },
    ]

    vi.mocked(prisma.feeStructure.findMany).mockResolvedValue(mockFees as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.feeStructures.length).toBe(1)
    expect(data.feeStructures[0].name).toBe('Annual Tuition')
  })

  it('validates schema on POST creation', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
