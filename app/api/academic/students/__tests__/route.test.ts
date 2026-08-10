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
    student: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
    studentBatch: {
      findFirst: vi.fn(),
    },
  },
}))

describe('/api/academic/students Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/academic/students')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns paginated students list when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const mockStudents = [
      { id: 's1', studentId: 'STU001', name: 'John Doe', age: 12, status: 'ACCEPTED' },
    ]

    vi.mocked(prisma.student.findMany).mockResolvedValue(mockStudents as any)
    vi.mocked(prisma.student.count).mockResolvedValue(1)

    const req = new NextRequest('http://localhost:3000/api/academic/students?page=1&limit=10')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.students).toHaveLength(1)
    expect(data.pagination.total).toBe(1)
  })

  it('returns 400 when creating a student without required name field', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/students', {
      method: 'POST',
      body: JSON.stringify({ age: 10, grade: 'Grade 5' }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
