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

describe('/api/financial/budget POST Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 when session role is not ADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'STUDENT' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/budget', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error).toContain('Unauthorized')
  })

  it('returns 400 when budget amount is invalid or missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/budget', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        department: '',
        amount: -100,
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates budget expense successfully with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN' },
    } as any)

    vi.mocked(prisma.budgetExpense.create).mockResolvedValue({
      id: 'b-exp-1',
      department: 'IT Equipment',
      amount: 25000,
      description: 'Laptops',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/budget', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        department: 'IT Equipment',
        amount: 25000,
        description: 'Laptops',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Budget expense created successfully')
  })
})
