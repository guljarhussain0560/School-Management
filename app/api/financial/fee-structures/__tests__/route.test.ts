import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    feeStructure: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('/api/financial/fee-structures Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthorized for GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 403 when non-admin attempts POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'STUDENT' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('returns 400 when invalid payload is passed to POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '',
        amount: -50,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates fee structure successfully with valid Zod input', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.feeStructure.count).mockResolvedValue(0)
    vi.mocked(prisma.feeStructure.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.feeStructure.create).mockResolvedValue({
      id: 'fs-1',
      name: 'Tuition Fee 2026',
      amount: 5000,
      feeCode: 'FEE001',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-structures', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Tuition Fee 2026',
        amount: 5000,
        frequency: 'MONTHLY',
        category: 'TUITION',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Fee structure created successfully')
    expect(data.feeStructure.name).toBe('Tuition Fee 2026')
  })
})
