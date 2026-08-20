import { describe, it, expect } from 'vitest'
import {
  validateField,
  validateForm,
  isFormValid,
  ValidationPatterns,
  FieldValidators,
} from '../form-validation'

describe('lib/form-validation utilities', () => {
  it('validates single field requirements and types', () => {
    expect(validateField({ name: 'email', value: '', required: true })).toBe('email is required')
    expect(validateField({ name: 'email', value: 'bad-email', type: 'email' })).toBe('Please enter a valid email address')
    expect(validateField({ name: 'email', value: 'valid@school.edu', type: 'email' })).toBeNull()
    expect(validateField({ name: 'age', value: 'not-a-number', type: 'number' })).toBe('Please enter a valid number')
  })

  it('validates full form fields dictionary', () => {
    const result = validateForm([
      { name: 'name', value: 'Jane Doe', required: true },
      { name: 'email', value: 'jane@example.com', required: true, type: 'email' },
    ])
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })

  it('checks isFormValid against required field list', () => {
    const data = { name: 'Admin User', role: 'ADMIN', email: 'admin@school.com' }
    expect(isFormValid(data, ['name', 'role'])).toBe(true)
    expect(isFormValid(data, ['name', 'phone'])).toBe(false)
  })

  it('validates pattern regex and field validators', () => {
    expect(ValidationPatterns.phone.test('9876543210')).toBe(true)
    expect(FieldValidators.email('invalid-email')).toBe('Please enter a valid email address')
    expect(FieldValidators.email('test@school.edu')).toBeNull()
    expect(FieldValidators.pincode('123456')).toBeNull()
    expect(FieldValidators.pincode('123')).toBe('Please enter a valid 6-digit pincode')
  })
})
