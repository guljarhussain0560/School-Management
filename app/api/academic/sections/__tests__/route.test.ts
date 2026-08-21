import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    class: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    grade: {
      findUnique: vi.fn(),
    },
    studentBatch: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Academic Sections API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/academic/sections')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('fetches sections with pagination for authenticated school', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const mockSections = [
      { id: 'sec-1', sectionName: 'A', classCode: 'G10A', capacity: 40 },
    ]

    vi.mocked(prisma.class.findMany).mockResolvedValue(mockSections as any)
    vi.mocked(prisma.class.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/academic/sections')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.sections.length).toBe(1)
    expect(data.sections[0].classCode).toBe('G10A')
  })
})
