import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, DELETE } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    teacherAssignment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Teacher Assignments API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated on GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/teacher-assignments')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns list of assignments for authenticated session', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const mockAssignments = [
      {
        id: 'ta-1',
        teacherId: 't-1',
        subjectId: 'sub-1',
        classId: 'c-1',
        teacher: { id: 't-1', name: 'John Doe', email: 'john@example.com' },
        subject: { id: 'sub-1', subjectName: 'Math', subjectCode: 'M101' },
        class: { id: 'c-1', classCode: 'C10A', sectionName: 'A' },
      },
    ]

    vi.mocked(prisma.teacherAssignment.findMany).mockResolvedValue(mockAssignments as any)

    const req = new NextRequest('http://localhost:3000/api/academic/teacher-assignments')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.assignments.length).toBe(1)
    expect(data.assignments[0].teacher.name).toBe('John Doe')
  })

  it('creates assignment when valid payload provided', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 't-1',
      name: 'John Doe',
      role: 'TEACHER',
      schoolId: 's1',
    } as any)

    vi.mocked(prisma.teacherAssignment.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.teacherAssignment.create).mockResolvedValue({
      id: 'ta-2',
      teacherId: 't-1',
      subjectId: 'sub-1',
      classId: 'c-1',
      teacher: { id: 't-1', name: 'John Doe', email: 'john@example.com' },
      subject: { id: 'sub-1', subjectName: 'Math' },
      class: { id: 'c-1', classCode: 'C10A' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/teacher-assignments', {
      method: 'POST',
      body: JSON.stringify({
        teacherId: 't-1',
        subjectId: 'sub-1',
        classId: 'c-1',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
