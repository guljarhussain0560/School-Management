import { describe, it, expect } from 'vitest'
import { cn, generateTemporaryPassword, validateEmail, validatePhoneNumber, slugify, truncateText, getRoleDisplayName } from '../utils'

describe('Application Utilities (lib/utils)', () => {
  it('merges Tailwind classnames correctly with cn', () => {
    const result = cn('px-2 py-1', 'px-4', { 'bg-red-500': true, 'bg-blue-500': false })
    expect(result).toBe('py-1 px-4 bg-red-500')
  })

  it('generates an 8-character temporary password', () => {
    const password = generateTemporaryPassword()
    expect(password).toHaveLength(8)
  })

  it('validates email format correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('@no-user.com')).toBe(false)
  })

  it('validates international phone numbers', () => {
    expect(validatePhoneNumber('+1234567890')).toBe(true)
    expect(validatePhoneNumber('not-a-phone')).toBe(false)
  })

  it('slugifies string titles properly', () => {
    expect(slugify('Grade 10 Mathematics Exam 2026!')).toBe('grade-10-mathematics-exam-2026')
  })

  it('truncates long text properly', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...')
    expect(truncateText('Short', 10)).toBe('Short')
  })

  it('returns human-readable role display names', () => {
    expect(getRoleDisplayName('ADMIN')).toBe('Administrator')
    expect(getRoleDisplayName('TEACHER')).toBe('Teacher')
    expect(getRoleDisplayName('TRANSPORT')).toBe('Transport Manager')
  })
})
