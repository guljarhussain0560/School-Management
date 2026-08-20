import { describe, it, expect } from 'vitest'
import { validateData, createEmployeeSchema, createClassSchema } from '../index'

describe('lib/validation validateData utility', () => {
  it('returns success: true and parsed data when input is valid', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      department: 'ACADEMIC',
      position: 'Senior Teacher',
      salary: 50000,
      role: 'TEACHER',
      dateOfJoining: '2026-01-15',
    }

    const result = validateData(createEmployeeSchema, validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('John Doe')
    }
  })

  it('returns success: false with formatted field error messages when invalid', () => {
    const invalidData = {
      className: '',
      level: '',
    }

    const result = validateData(createClassSchema, invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBeDefined()
    }
  })
})
