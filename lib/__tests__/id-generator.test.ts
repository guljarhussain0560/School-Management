import { describe, it, expect, beforeEach } from 'vitest'
import { IDGenerator } from '../id-generator'

describe('IDGenerator Service', () => {
  beforeEach(() => {
    IDGenerator.initialize({
      schoolCode: 'DPS',
      academicYear: '2025-26',
    })
  })

  it('generates student ID with school code, year, batch, and padded sequence', () => {
    const id = IDGenerator.generateStudentId('A', 5)
    expect(id).toBe('DPS26A005')
  })

  it('generates strong 12-character employee ID with role prefix and year', () => {
    const adminId = IDGenerator.generateEmployeeId('ADMIN', 1)
    const teacherId = IDGenerator.generateEmployeeId('TEACHER', 2)
    const transportId = IDGenerator.generateEmployeeId('TRANSPORT', 3)

    expect(adminId.startsWith('ADM26')).toBe(true)
    expect(teacherId.startsWith('TCH26')).toBe(true)
    expect(transportId.startsWith('TRP26')).toBe(true)
  })

  it('generates class code for standard and nursery levels', () => {
    expect(IDGenerator.generateClassCode('26A', 5, 'A')).toBe('26A5A')
    expect(IDGenerator.generateClassCode('26A', 0, 'A')).toBe('26ANUR')
  })

  it('generates subject code from category, subject name and level', () => {
    expect(IDGenerator.generateSubjectCode('Core', 'Mathematics', 1)).toBe('CMAT01')
  })

  it('generates bus number based on route, capacity and sequence', () => {
    expect(IDGenerator.generateBusNumber(2, 'LARGE', 1)).toBe('DPSR02L001')
    expect(IDGenerator.generateBusNumber(5, 'MEDIUM', 3)).toBe('DPSR05M003')
  })

  it('generates roll number, exam ID, batch code and assignment ID', () => {
    expect(IDGenerator.generateRollNumber('26A5A', '2025-26', 12)).toBe('26A5A26012')
    expect(IDGenerator.generateExamId('MIDTERM', 'MAT01', '26A5A', '2026-03-15')).toBe('MIMAT0126A5A20260315')
    expect(IDGenerator.generateBatchCode('2025-26', 1)).toBe('26A')
    expect(IDGenerator.generateAssignmentId('MAT01', '26A5A', '2026-03-15', 1)).toBe('MAT0126A5A20260315001')
  })
})
