import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
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

describe('/api/employee Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/employee', () => {
    it('returns 403 when user is not authenticated or not admin', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new NextRequest('http://localhost:3000/api/employee')
      const res = await GET(req)
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.error).toContain('Unauthorized')
    })

    it('returns 200 with employees list and summary for admin', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.employee.count).mockResolvedValue(10)
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        {
          id: 'emp-1',
          employeeId: 'EMP-001',
          name: 'John Doe',
          email: 'john@school.com',
          department: 'Academic',
          position: 'Teacher',
          salary: 50000,
          createdAt: new Date(),
        } as any,
      ])
      vi.mocked(prisma.employee.aggregate).mockResolvedValue({
        _sum: { salary: 50000 },
      } as any)

      const req = new NextRequest('http://localhost:3000/api/employee?page=1&limit=10')
      const res = await GET(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.employees).toHaveLength(1)
      expect(data.pagination.totalCount).toBe(10)
    })
  })

  describe('POST /api/employee', () => {
    it('returns 400 when validation fails (e.g. invalid email or missing fields)', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      const req = new NextRequest('http://localhost:3000/api/employee', {
        method: 'POST',
        body: JSON.stringify({
          name: 'J', // too short
          email: 'invalid-email',
          department: '',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('creates employee and returns 201 when valid data is provided', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.employee.findUnique).mockResolvedValueOnce(null)
      vi.mocked(prisma.employee.create).mockResolvedValueOnce({
        id: 'new-emp-id',
        employeeId: 'EMP-TEACHER-001',
        name: 'Sarah Connor',
        email: 'sarah@school.com',
        department: 'Science',
        position: 'Physics Teacher',
        salary: 60000,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/employee', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: 'sarah@school.com',
          department: 'Science',
          position: 'Physics Teacher',
          salary: 60000,
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.message).toBe('Employee registered successfully')
    })
  })
})
