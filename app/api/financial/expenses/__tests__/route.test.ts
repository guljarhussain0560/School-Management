import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    budgetExpense: {
      create: vi.fn(),
    },
  },
}))

describe('/api/financial/expenses POST Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 when session is not ADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'TEACHER' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/expenses', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error).toContain('Unauthorized')
  })

  it('returns 400 when expense amount is invalid or missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/expenses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        department: 'Science Lab',
        amount: -500,
        description: 'New beakers',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates expense successfully with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN' },
    } as any)

    vi.mocked(prisma.budgetExpense.create).mockResolvedValue({
      id: 'exp-1',
      department: 'Science Lab',
      amount: 1500,
      description: 'Microscopes',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/expenses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        department: 'Science Lab',
        amount: 1500,
        description: 'Microscopes',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Expense recorded successfully')
  })
})
