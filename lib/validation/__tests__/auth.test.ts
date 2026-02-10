import { describe, it, expect } from 'vitest'
import { registerSchoolSchema, loginSchema, resetPasswordSchema } from '../auth'

describe('Auth Validation Schemas', () => {
  it('validates school registration payload', () => {
    const valid = {
      name: 'Dr. John Smith',
      email: 'principal@school.edu',
      password: 'SecurePassword123!',
      schoolName: 'Greenwood International',
      schoolRegNo: 'REG-2026-99',
      phone: '+1-555-0199',
      entityType: 'school' as const,
    }
    const result = registerSchoolSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('fails when registration password is too short', () => {
    const invalid = {
      name: 'John',
      email: 'john@test.com',
      password: '123', // under 8 chars
      schoolName: 'School',
      schoolRegNo: 'REG-01',
      phone: '1234567890',
    }
    const result = registerSchoolSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates user login credentials', () => {
    const valid = {
      email: 'user@school.com',
      password: 'password123',
    }
    const result = loginSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})
