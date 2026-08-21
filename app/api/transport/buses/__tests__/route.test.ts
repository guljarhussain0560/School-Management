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
    bus: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/transport/buses Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 on GET when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/transport/buses')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns buses on GET when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.bus.findMany).mockResolvedValue([
      { id: 'bus-1', busNumber: 'BUS-01', capacity: 40, status: 'ACTIVE' } as any,
    ])
    vi.mocked(prisma.bus.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/transport/buses')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.buses.length).toBe(1)
  })

  it('returns 403 on POST for unauthorized roles', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'TEACHER', schoolId: 'school-1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/transport/buses', {
      method: 'POST',
      body: JSON.stringify({ busNumber: 'BUS-02' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates bus successfully on POST with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.bus.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.bus.create).mockResolvedValue({
      id: 'bus-2',
      busNumber: 'BUS-02',
      capacity: 35,
      driverName: 'John',
      driverPhone: '555-1234',
      status: 'ACTIVE',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/transport/buses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        busNumber: 'BUS-02',
        capacity: 35,
        driverName: 'John',
        driverPhone: '555-1234',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.bus.busNumber).toBe('BUS-02')
  })
})
