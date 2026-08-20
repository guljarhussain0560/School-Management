import { describe, it, expect, vi } from 'vitest'
import {
  generateUniqueEmployeeId,
  validateEmployeeIdFormat,
  extractEmployeeIdNumber,
} from '../employee-utils'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
    },
  },
}))

describe('lib/employee-utils', () => {
  it('validates employee ID format correctly', () => {
    expect(validateEmployeeIdFormat('EMP123456')).toBe(true)
    expect(validateEmployeeIdFormat('EMP12345')).toBe(false)
    expect(validateEmployeeIdFormat('TCH123456')).toBe(false)
  })

  it('extracts employee ID numeric portion', () => {
    expect(extractEmployeeIdNumber('EMP123456')).toBe(123456)
    expect(() => extractEmployeeIdNumber('INVALID')).toThrow('Invalid employee ID format')
  })

  it('generates unique employee ID using prisma check', async () => {
    vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

    const empId = await generateUniqueEmployeeId()
    expect(validateEmployeeIdFormat(empId)).toBe(true)
  })
})
