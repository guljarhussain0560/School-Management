import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    budgetExpense: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}))

describe('/api/financial/expenses Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 on GET when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/financial/expenses')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns expenses list on GET when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.budgetExpense.count).mockResolvedValue(1)
    vi.mocked(prisma.budgetExpense.findMany).mockResolvedValue([
      { id: 'exp-1', department: 'Science', amount: 450, description: 'Lab supplies' } as any,
    ])
    vi.mocked(prisma.budgetExpense.aggregate).mockResolvedValue({
      _sum: { amount: 450 },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/expenses')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.expenses.length).toBe(1)
  })

  it('creates expense record on POST with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.budgetExpense.create).mockResolvedValue({
      id: 'exp-2',
      department: 'Math',
      amount: 150,
      description: 'Calculators',
      status: 'PENDING',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/expenses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        department: 'Math',
        amount: 150,
        description: 'Calculators',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.expense.department).toBe('Math')
  })
})
