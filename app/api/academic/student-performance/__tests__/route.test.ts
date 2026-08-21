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
    studentPerformance: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    subject: {
      findFirst: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
    student: {
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/academic/student-performance Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthorized for GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/student-performance')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when submitting invalid marks payload in POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'TEACHER', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/student-performance', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        studentId: '',
        marks: -5,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates student performance successfully with valid input', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'TEACHER', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.subject.findFirst).mockResolvedValue({ id: 'sub-1', subjectName: 'Mathematics' } as any)
    vi.mocked(prisma.class.findFirst).mockResolvedValue({ id: 'cls-1', classCode: '10th' } as any)
    vi.mocked(prisma.student.findFirst).mockResolvedValue({ id: 'stu-1', name: 'John Doe' } as any)
    vi.mocked(prisma.studentPerformance.create).mockResolvedValue({
      id: 'perf-1',
      marks: 95,
      maxMarks: 100,
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/student-performance', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        studentId: 'stu-1',
        subject: 'Mathematics',
        grade: '10th',
        marks: 95,
        maxMarks: 100,
        examType: 'Midterm',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Student performance recorded successfully')
  })
})
