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
    busRoute: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    bus: {
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/transport/routes Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 on GET when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/transport/routes')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns routes list on GET when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.busRoute.findMany).mockResolvedValue([
      { id: 'rt-1', routeName: 'Downtown Loop' } as any,
    ])
    vi.mocked(prisma.busRoute.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/transport/routes')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.routes.length).toBe(1)
  })

  it('creates route successfully on POST with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.busRoute.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.bus.findFirst).mockResolvedValue({ id: 'bus-1' } as any)
    vi.mocked(prisma.busRoute.create).mockResolvedValue({
      id: 'rt-2',
      routeName: 'North Highway',
      status: 'ON_TIME',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/transport/routes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        routeName: 'North Highway',
        status: 'ON_TIME',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.route.routeName).toBe('North Highway')
  })
})
