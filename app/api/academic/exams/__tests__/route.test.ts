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
    exam: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('/api/academic/exams Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated in GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/exams')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when creating an exam with invalid Zod payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/exams', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        examName: '',
        totalMarks: -10,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates exam successfully with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.exam.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.exam.create).mockResolvedValue({
      id: 'ex-1',
      examName: 'Midterm Math',
      examType: 'MID_TERM',
      totalMarks: 100,
      passingMarks: 40,
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/exams', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        examName: 'Midterm Math',
        examType: 'MID_TERM',
        subjectId: 'sub-1',
        classId: 'cls-1',
        totalMarks: 100,
        passingMarks: 40,
        duration: 120,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Exam created successfully')
    expect(data.exam.examName).toBe('Midterm Math')
  })
})
