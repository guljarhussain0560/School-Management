import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IDGenerator } from '../id-generator'
import { IDService } from '../id-service'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    student: { findMany: vi.fn() },
    employee: { findMany: vi.fn() },
    grade: { findMany: vi.fn() },
    school: { findUnique: vi.fn() },
  },
}))

describe('IDService and IDGenerator Suites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    IDGenerator.initialize({
      schoolCode: 'GW',
      academicYear: '2026-27',
    })
  })

  it('generates structured student IDs correctly', () => {
    const studentId = IDGenerator.generateStudentId('B10', 1)
    expect(studentId).toBe('GW27B10001')

    const studentId2 = IDGenerator.generateStudentId('B10', 42)
    expect(studentId2).toBe('GW27B10042')
  })

  it('generates employee IDs based on role', () => {
    const adminId = IDGenerator.generateEmployeeId('ADMIN', 0)
    expect(adminId).toContain('ADM')

    const teacherId = IDGenerator.generateEmployeeId('TEACHER', 0)
    expect(teacherId).toContain('TCH')

    const transportId = IDGenerator.generateEmployeeId('TRANSPORT', 0)
    expect(transportId).toContain('TRP')
  })

  it('generates bus numbers with route and capacity format', () => {
    const busNumber = IDGenerator.generateBusNumber(5, 'LARGE', 1)
    expect(busNumber).toBe('GWR05L001')
  })

  it('IDService generates student ID with database check', async () => {
    vi.mocked(prisma.student.findMany).mockResolvedValue([
      { studentId: 'GW27B10001' },
    ] as any)

    const nextId = await IDService.generateStudentId('B10', 'school-1')
    expect(nextId).toBe('GW27B10002')
  })

  it('IDService generates employee ID with database check', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([])

    const empId = await IDService.generateEmployeeId('TEACHER', 'school-1')
    expect(empId).toContain('TCH')
  })
})
