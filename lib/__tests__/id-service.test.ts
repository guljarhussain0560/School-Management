import { describe, it, expect, beforeEach } from 'vitest'
import { IDGenerator } from '../id-generator'

describe('IDGenerator Utility', () => {
  beforeEach(() => {
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
})
