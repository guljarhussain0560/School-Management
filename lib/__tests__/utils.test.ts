import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText,
  generateTemporaryPassword,
  generateResetToken,
  getRoleDisplayName,
  slugify,
  validateEmail,
  validatePhoneNumber,
} from '../utils'

describe('lib/utils helper functions', () => {
  it('merges classNames using cn', () => {
    expect(cn('px-2', 'py-1', { 'bg-red-500': true, 'bg-blue-500': false })).toContain('px-2 py-1 bg-red-500')
  })

  it('formats currency correctly in INR', () => {
    const formatted = formatCurrency(50000)
    expect(formatted).toContain('50,000')
  })

  it('formats date and datetime properly', () => {
    const d = new Date('2026-05-15T12:00:00Z')
    expect(formatDate(d)).toBeDefined()
    expect(formatDateTime(d)).toBeDefined()
  })

  it('truncates text with ellipsis when exceeding length', () => {
    expect(truncateText('Hello Senior Software Engineer', 10)).toBe('Hello Seni...')
    expect(truncateText('Short', 10)).toBe('Short')
  })

  it('generates random temporary passwords and reset tokens', () => {
    const pwd = generateTemporaryPassword()
    expect(pwd.length).toBe(8)
    const token = generateResetToken()
    expect(token.length).toBe(64)
  })

  it('returns role display names', () => {
    expect(getRoleDisplayName('ADMIN')).toBe('Administrator')
    expect(getRoleDisplayName('TEACHER')).toBe('Teacher')
    expect(getRoleDisplayName('TRANSPORT')).toBe('Transport Manager')
  })

  it('slugifies string titles', () => {
    expect(slugify('High School Math 101')).toBe('high-school-math-101')
  })

  it('validates email addresses and phone numbers', () => {
    expect(validateEmail('test@school.edu')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validatePhoneNumber('+919876543210')).toBe(true)
  })
})
