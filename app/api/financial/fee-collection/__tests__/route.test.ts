import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    feeCollection: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
      create: vi.fn(),
    },
    student: {
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/financial/fee-collection Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 when non-admin accesses GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'TEACHER' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-collection')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error).toContain('Unauthorized')
  })

  it('returns 400 when collecting fee with missing or invalid fields in POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-collection', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        studentId: '',
        amount: -500,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('returns 404 when student is not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)
    vi.mocked(prisma.student.findFirst).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-collection', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        studentId: 'STU-999',
        amount: 2500,
        paymentMode: 'CASH',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toBe('Student not found')
  })

  it('collects fee successfully with valid Zod input', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)
    vi.mocked(prisma.student.findFirst).mockResolvedValue({
      id: 'stu-1',
      studentId: 'STU-001',
      name: 'Bob Smith',
      class: { classCode: '10-A', sectionName: 'A' },
    } as any)

    vi.mocked(prisma.feeCollection.create).mockResolvedValue({
      id: 'fc-1',
      feeId: 'FEE202601001',
      amount: 2500,
      paymentMode: 'CASH',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/fee-collection', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        studentId: 'STU-001',
        amount: 2500,
        paymentMode: 'CASH',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Fee collected successfully')
  })
})
