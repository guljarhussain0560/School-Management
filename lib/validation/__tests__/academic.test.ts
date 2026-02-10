import { describe, it, expect } from 'vitest'
import { createClassSchema, recordAttendanceSchema, createExamSchema } from '../academic'

describe('Academic Validation Schemas', () => {
  it('validates class creation schema', () => {
    const valid = {
      className: 'Grade 10-A',
      level: '10',
      section: 'A',
      capacity: 35,
      batchId: 'batch-123',
    }
    const result = createClassSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('validates attendance recording schema with valid records', () => {
    const validAttendance = {
      date: '2026-08-20',
      grade: 'Grade 10',
      attendanceRecords: [
        { studentId: 'stu-1', status: 'PRESENT' as const },
        { studentId: 'stu-2', status: 'ABSENT' as const },
      ],
    }
    const result = recordAttendanceSchema.safeParse(validAttendance)
    expect(result.success).toBe(true)
  })

  it('fails attendance validation when date format is invalid', () => {
    const invalid = {
      date: '20-08-2026', // wrong format, expects YYYY-MM-DD
      grade: 'Grade 10',
      attendanceRecords: [{ studentId: 'stu-1', status: 'PRESENT' as const }],
    }
    const result = recordAttendanceSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
