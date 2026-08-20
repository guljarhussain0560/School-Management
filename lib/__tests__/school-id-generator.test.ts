import { describe, it, expect } from 'vitest'
import { generateSchoolId, validateSchoolId, parseSchoolId } from '../school-id-generator'

describe('lib/school-id-generator', () => {
  it('generates a valid 12-character school ID matching scheme', () => {
    const id = generateSchoolId('Greenwood International', 'REG12345')
    expect(id.length).toBe(12)
    expect(id.startsWith('SCH')).toBe(true)
    expect(validateSchoolId(id)).toBe(true)
  })

  it('validates school ID format properly', () => {
    expect(validateSchoolId('SCH45GR26A1B')).toBe(true)
    expect(validateSchoolId('INVALID')).toBe(false)
  })

  it('parses valid school ID components', () => {
    const parsed = parseSchoolId('SCH45GR26A1B')
    expect(parsed.prefix).toBe('SCH')
    expect(parsed.regDigits).toBe('45')
    expect(parsed.consonants).toBe('GR')
  })

  it('throws error when parsing invalid school ID', () => {
    expect(() => parseSchoolId('BAD_ID')).toThrow('Invalid school ID format')
  })
})
