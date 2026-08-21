import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    exam: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    subject: {
      findFirst: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Academic Exams API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/exams')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('fetches exams list for authenticated school user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const mockExams = [
      { id: 'ex-1', examName: 'Midterm 2026', totalMarks: 100, passingMarks: 40 },
    ]

    vi.mocked(prisma.exam.findMany).mockResolvedValue(mockExams as any)

    const req = new NextRequest('http://localhost:3000/api/academic/exams')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.exams.length).toBe(1)
    expect(data.exams[0].examName).toBe('Midterm 2026')
  })

  it('returns 400 when invalid payload sent to POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/exams', {
      method: 'POST',
      body: JSON.stringify({ examName: '' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
