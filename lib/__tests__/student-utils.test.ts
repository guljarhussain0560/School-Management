import { describe, it, expect, vi } from 'vitest'
import {
  generateUniqueStudentId,
  validateStudentIdFormat,
  extractStudentIdNumber,
} from '../student-utils'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    student: {
      findUnique: vi.fn(),
    },
  },
}))

describe('lib/student-utils', () => {
  it('validates student ID format correctly', () => {
    expect(validateStudentIdFormat('STU12345678')).toBe(true)
    expect(validateStudentIdFormat('STU1234567')).toBe(false)
    expect(validateStudentIdFormat('EMP12345678')).toBe(false)
  })

  it('extracts student ID numeric portion', () => {
    expect(extractStudentIdNumber('STU12345678')).toBe(12345678)
    expect(() => extractStudentIdNumber('INVALID')).toThrow('Invalid student ID format')
  })

  it('generates unique student ID using prisma check', async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null)

    const stuId = await generateUniqueStudentId()
    expect(validateStudentIdFormat(stuId)).toBe(true)
  })
})
