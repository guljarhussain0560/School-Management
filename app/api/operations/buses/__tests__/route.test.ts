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
    bus: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('/api/operations/buses Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session is unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/operations/buses')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns list of fleet buses for authenticated school', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const mockBuses = [
      { id: 'b1', busNumber: 'BUS-01', busName: 'Yellow Express', capacity: 40, status: 'ACTIVE' },
    ]

    vi.mocked(prisma.bus.findMany).mockResolvedValue(mockBuses as any)

    const req = new NextRequest('http://localhost:3000/api/operations/buses')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.buses).toHaveLength(1)
    expect(data.buses[0].busNumber).toBe('BUS-01')
  })

  it('returns 400 when creating a bus with invalid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/operations/buses', {
      method: 'POST',
      body: JSON.stringify({
        capacity: -10, // Invalid negative capacity
        busName: '',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })
})
