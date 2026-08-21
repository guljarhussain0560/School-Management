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
  },
}))

describe('/api/students Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when session is missing in GET', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new NextRequest('http://localhost:3000/api/students')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when session role is not authorized in POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'STUDENT' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify({ name: 'John Doe' }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when required student fields are missing in POST', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'J', // less than 2 chars
        classId: '',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates student successfully with valid Zod payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.student.create).mockResolvedValue({
      id: 'stu-123',
      name: 'Alice Johnson',
      classId: 'cls-1',
      studentId: 'STU123456',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson',
        classId: 'cls-1',
        email: 'alice@example.com',
        phone: '1234567890',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Student created successfully')
    expect(data.student.name).toBe('Alice Johnson')
  })
})
