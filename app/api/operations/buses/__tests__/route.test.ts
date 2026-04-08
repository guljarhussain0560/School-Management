import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    bus: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    school: {
      findUnique: vi.fn().mockResolvedValue({ id: 'school-1', schoolCode: 'SCH', name: 'Test School' }),
    },
    studentBatch: {
      findFirst: vi.fn().mockResolvedValue({ id: 'batch-1', academicYear: '2026-27' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'batch-1', batchCode: 'B2026' }),
    },
    schoolIdCounter: {
      findUnique: vi.fn().mockResolvedValue({ currentCount: 1 }),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('/api/operations/buses Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.bus.findMany).mockResolvedValue([])
    vi.mocked(prisma.school.findUnique).mockResolvedValue({ id: 'school-1', schoolCode: 'SCH', name: 'Test School' } as any)
    vi.mocked(prisma.studentBatch.findFirst).mockResolvedValue({ id: 'batch-1', academicYear: '2026-27' } as any)
  })

  describe('GET /api/operations/buses', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new NextRequest('http://localhost:3000/api/operations/buses')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('returns 200 with list of buses when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.bus.findMany).mockResolvedValueOnce([
        {
          id: 'bus-1',
          busNumber: 'BUS-01',
          busName: 'Yellow Express',
          capacity: 45,
          driverName: 'Robert Green',
          status: 'ACTIVE',
          routes: [],
        } as any,
      ])
      vi.mocked(prisma.bus.count).mockResolvedValueOnce(1)

      const req = new NextRequest('http://localhost:3000/api/operations/buses')
      const res = await GET(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.buses).toHaveLength(1)
      expect(data.pagination.totalCount).toBe(1)
    })
  })

  describe('POST /api/operations/buses', () => {
    it('returns 400 when missing route or capacity', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      const req = new NextRequest('http://localhost:3000/api/operations/buses', {
        method: 'POST',
        body: JSON.stringify({
          // missing route
          capacity: 50,
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('creates a new bus and returns 200 when valid data is provided', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.bus.create).mockResolvedValueOnce({
        id: 'bus-new',
        busNumber: 'BUS-NORTH-50',
        capacity: 50,
        driverName: 'Driver Smith',
        status: 'ACTIVE',
        routes: [],
      } as any)

      const req = new NextRequest('http://localhost:3000/api/operations/buses', {
        method: 'POST',
        body: JSON.stringify({
          route: 'North Route',
          capacity: 50,
          driverName: 'Driver Smith',
          status: 'ACTIVE',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Bus created successfully')
    })
  })
})
