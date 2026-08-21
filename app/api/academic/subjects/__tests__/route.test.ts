import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subject: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Academic Subjects API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated on GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/subjects')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns subjects list for authenticated user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const mockSubjects = [
      { id: 'sub-1', subjectName: 'Physics', subjectCode: 'PHY101', credits: 4 },
    ]

    vi.mocked(prisma.subject.findMany).mockResolvedValue(mockSubjects as any)
    vi.mocked(prisma.subject.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/academic/subjects')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.subjects.length).toBe(1)
    expect(data.subjects[0].subjectName).toBe('Physics')
  })
})
