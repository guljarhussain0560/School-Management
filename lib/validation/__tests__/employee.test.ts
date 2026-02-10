import { describe, it, expect } from 'vitest'
import { createEmployeeSchema, employeeQuerySchema } from '../employee'

describe('Employee Validation Schemas', () => {
  it('validates a valid employee payload successfully', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Mathematics',
      position: 'Senior Teacher',
      salary: '75000',
      phone: '+1234567890',
    }

    const result = createEmployeeSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.salary).toBe(75000)
    }
  })

  it('fails when email is malformed', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'not-an-email',
      department: 'Science',
      position: 'Teacher',
      salary: 50000,
    }

    const result = createEmployeeSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('validates employee query params with defaults', () => {
    const result = employeeQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(10)
      expect(result.data.field).toBe('name')
    }
  })
})
