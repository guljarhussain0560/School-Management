import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { IDService } from '@/lib/id-service'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
    admissionSetting: {
      findFirst: vi.fn(),
    },
    busRoute: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/id-service', () => ({
  IDService: {
    initializeSchool: vi.fn().mockResolvedValue(undefined),
    generateStudentId: vi.fn().mockResolvedValue('GW26001'),
    generateRollNumber: vi.fn().mockResolvedValue('R101'),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('/api/academic/students Route Handlers', () => {
  const mockAdminSession = {
    user: {
      id: 'admin-1',
      role: 'ADMIN',
      schoolId: 'school-123',
      name: 'Admin User',
    },
  }

  const mockClassInfo = {
    id: 'sec-1',
    classCode: 'G10A',
    batch: { id: 'b-1', batchCode: 'B2026', academicYear: '2026-2027' },
    grade: { id: 'g-1', gradeCode: 'G10' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any)
    vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClassInfo as any)
  })

  describe('GET /api/academic/students', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)
      const req = new NextRequest('http://localhost:3000/api/academic/students')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('returns paginated and filtered students', async () => {
      const mockStudents = [
        {
          id: 'stu-1',
          studentId: 'GW26001',
          name: 'Harry Potter',
          email: 'harry@hogwarts.edu',
          age: 15,
          rollNumber: 'R101',
          status: 'ACTIVE',
        },
      ]

      vi.mocked(prisma.student.findMany).mockResolvedValueOnce(mockStudents as any)
      vi.mocked(prisma.student.count).mockResolvedValueOnce(1)

      const req = new NextRequest('http://localhost:3000/api/academic/students?page=1&limit=10&search=Harry&status=ACTIVE')
      const res = await GET(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.students).toHaveLength(1)
      expect(json.pagination.total).toBe(1)
      expect(json.pagination.page).toBe(1)
    })
  })

  describe('POST /api/academic/students', () => {
    it('returns 403 when user is not admin or teacher', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'parent-1', role: 'PARENT', schoolId: 'school-123' },
      } as any)

      const req = new NextRequest('http://localhost:3000/api/academic/students', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Ron Weasley' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(403)
    })

    it('returns 400 when required fields are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/academic/students', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Incomplete Student' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('creates student successfully with valid JSON body', async () => {
      vi.mocked(prisma.student.create).mockResolvedValueOnce({
        id: 'stu-new-1',
        studentId: 'GW26001',
        name: 'Hermione Granger',
        age: 15,
        status: 'ACTIVE',
        schoolId: 'school-123',
      } as any)

      const req = new NextRequest('http://localhost:3000/api/academic/students', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Hermione Granger',
          email: 'hermione@hogwarts.edu',
          age: 15,
          sectionId: 'sec-1',
          parentName: 'Mr. Granger',
          parentEmail: 'parent@granger.com',
          parentPhone: '9876543210',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.student.name).toBe('Hermione Granger')
      expect(json.student.studentId).toBe('GW26001')
    })

    it('creates student successfully with multipart/form-data body', async () => {
      vi.mocked(prisma.student.create).mockResolvedValueOnce({
        id: 'stu-new-2',
        studentId: 'GW26002',
        name: 'Draco Malfoy',
        status: 'ACTIVE',
      } as any)

      const formData = new FormData()
      formData.append('name', 'Draco Malfoy')
      formData.append('age', '15')
      formData.append('sectionId', 'sec-1')
      formData.append('parentName', 'Lucius Malfoy')
      formData.append('parentEmail', 'lucius@malfoy.org')
      formData.append('parentPhone', '9876543212')

      const req = new NextRequest('http://localhost:3000/api/academic/students', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.student.name).toBe('Draco Malfoy')
    })
  })
})
