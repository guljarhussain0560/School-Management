import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    student: {
      findMany: vi.fn(),
    },
  },
}))

describe('/api/academic/attendance POST Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/academic/attendance', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when payload fails Zod validation', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/attendance', {
      method: 'POST',
      body: JSON.stringify({
        date: 'invalid-date',
        grade: '',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('records attendance successfully with valid payload', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'usr-1', role: 'ADMIN', schoolId: 'school-1' },
    } as any)

    vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.student.findMany).mockResolvedValue([{ id: 'stu-1' }] as any)
    vi.mocked(prisma.attendance.create).mockResolvedValue({ id: 'att-1' } as any)

    const req = new NextRequest('http://localhost:3000/api/academic/attendance', {
      method: 'POST',
      body: JSON.stringify({
        date: '2026-05-15',
        grade: 'Grade 5',
        subject: 'Mathematics',
        attendanceRecords: [{ studentId: 'stu-1', status: 'PRESENT' }],
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.message).toBe('Attendance recorded successfully')
  })
})
