import { describe, it, expect } from 'vitest'
import { collectFeeSchema, createFeeStructureSchema, createExpenseSchema, createPayrollSchema } from '../financial'

describe('Financial Validation Schemas', () => {
  it('validates fee collection schema', () => {
    const valid = {
      studentId: 'STU-001',
      amount: '500.00',
      paymentMode: 'CASH' as const,
      notes: 'Term 1 tuition',
    }
    const result = collectFeeSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(500)
    }
  })

  it('fails fee collection when amount is zero or negative', () => {
    const invalid = {
      studentId: 'STU-001',
      amount: 0,
      paymentMode: 'CASH' as const,
    }
    const result = collectFeeSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates departmental expense schema', () => {
    const valid = {
      department: 'Academic',
      amount: 1200,
      description: 'Chemistry lab glassware supplies',
    }
    const result = createExpenseSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('validates employee payroll schema', () => {
    const valid = {
      employeeId: 'EMP-001',
      basicSalary: 4500,
      allowances: 500,
      deductions: 200,
      month: 'August',
      year: '2026',
      status: 'Pending' as const,
    }
    const result = createPayrollSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})
