import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payroll: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}))

describe('/api/financial/payroll Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns payroll records when authenticated with ADMIN role', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const mockPayroll = [
      { id: 'p1', payrollId: 'PAY001', month: 'January', year: 2026, netSalary: 50000, status: 'PAID' },
    ]

    vi.mocked(prisma.payroll.findMany).mockResolvedValue(mockPayroll as any)
    vi.mocked(prisma.payroll.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll?page=1&limit=10')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.payrolls).toHaveLength(1)
  })
})
