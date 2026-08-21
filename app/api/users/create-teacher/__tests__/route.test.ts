import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  generateCredentialsEmail: vi.fn().mockReturnValue({}),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('/api/users/create-teacher POST Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 when session is not ADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'TEACHER' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/users/create-teacher', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error).toContain('Unauthorized')
  })

  it('returns 400 when invalid email or name is provided', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/users/create-teacher', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'T',
        email: 'not-an-email',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('creates teacher user successfully with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'u1', role: 'ADMIN', schoolId: 's1' },
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'teacher-1',
      name: 'Sarah Connor',
      email: 'sarah@school.edu',
      role: 'TEACHER',
      password: 'hashed-password',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/users/create-teacher', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah@school.edu',
        phone: '9876543210',
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.message).toBe('Teacher created successfully')
    expect(data.teacher.name).toBe('Sarah Connor')
  })
})
