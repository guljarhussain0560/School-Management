import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    class: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    school: {
      findUnique: vi.fn().mockResolvedValue({ id: 'school-1', schoolCode: 'SCH', name: 'Test School' }),
    },
    studentBatch: {
      findFirst: vi.fn().mockResolvedValue({ id: 'batch-1', academicYear: '2026-27' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'batch-1', batchCode: 'B2026' }),
    },
    grade: {
      findFirst: vi.fn().mockResolvedValue({ id: 'grade-1', gradeCode: 'G10', gradeName: 'Grade 10' }),
      create: vi.fn().mockResolvedValue({ id: 'grade-1', gradeCode: 'G10', gradeName: 'Grade 10' }),
    },
    schoolIdCounter: {
      findUnique: vi.fn().mockResolvedValue({ currentCount: 1 }),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('/api/academic/classes Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.class.findMany).mockResolvedValue([])
    vi.mocked(prisma.school.findUnique).mockResolvedValue({ id: 'school-1', schoolCode: 'SCH', name: 'Test School' } as any)
    vi.mocked(prisma.studentBatch.findFirst).mockResolvedValue({ id: 'batch-1', academicYear: '2026-27' } as any)
  })

  describe('GET /api/academic/classes', () => {
    it('returns 401 when unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new NextRequest('http://localhost:3000/api/academic/classes')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('returns 200 with list of classes when authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'teacher-1', role: 'TEACHER', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.class.findMany).mockResolvedValueOnce([
        {
          id: 'cls-1',
          className: 'Grade 10A',
          classCode: 'G10A',
          capacity: 30,
          batch: { id: 'b1', batchName: '2026-Batch', academicYear: '2026' },
          creator: { id: 'u1', name: 'Admin', email: 'admin@school.com' },
          subjects: [],
          _count: { students: 25, subjects: 6 },
        } as any,
      ])
      vi.mocked(prisma.class.count).mockResolvedValueOnce(1)

      const req = new NextRequest('http://localhost:3000/api/academic/classes')
      const res = await GET(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.classes).toHaveLength(1)
      expect(data.pagination.totalCount).toBe(1)
    })
  })

  describe('POST /api/academic/classes', () => {
    it('returns 400 when missing required fields', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      const req = new NextRequest('http://localhost:3000/api/academic/classes', {
        method: 'POST',
        body: JSON.stringify({
          className: 'Grade 10A',
          // missing level, section, batchId
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('creates class and returns 200 when valid data is provided', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN', schoolId: 'school-1' },
      } as any)

      vi.mocked(prisma.studentBatch.findUnique).mockResolvedValueOnce({
        id: 'batch-1',
        batchCode: 'B2026',
      } as any)

      vi.mocked(prisma.class.findFirst).mockResolvedValueOnce(null)
      vi.mocked(prisma.class.create).mockResolvedValueOnce({
        id: 'cls-new',
        className: 'Grade 10A',
        classCode: 'B2026-G10A',
        capacity: 35,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/academic/classes', {
        method: 'POST',
        body: JSON.stringify({
          className: 'Grade 10A',
          level: '10',
          section: 'A',
          batchId: 'batch-1',
          capacity: 35,
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Class created successfully')
    })
  })
})
