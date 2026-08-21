import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePayroll } from '../usePayroll'

describe('usePayroll Hook', () => {
  it('manages payroll calculations on basicSalary, allowances, and deductions change', () => {
    const { result } = renderHook(() => usePayroll())

    act(() => {
      result.current.handlePayrollChange('basicSalary', '5000')
      result.current.handlePayrollChange('allowances', '1000')
      result.current.handlePayrollChange('deductions', '500')
    })

    expect(result.current.payrollForm.basicSalary).toBe('5000')
    expect(result.current.payrollForm.allowances).toBe('1000')
    expect(result.current.payrollForm.deductions).toBe('500')
    expect(result.current.payrollForm.netSalary).toBe('5500.00')
  })
})
