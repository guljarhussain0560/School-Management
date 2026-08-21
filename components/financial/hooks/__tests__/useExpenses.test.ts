import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExpenses } from '../useExpenses'

describe('useExpenses Hook', () => {
  it('manages expense form state and resetting', () => {
    const { result } = renderHook(() => useExpenses())

    act(() => {
      result.current.handleExpenseChange('department', 'Science')
      result.current.handleExpenseChange('amount', '500')
      result.current.handleExpenseChange('description', 'Test lab items')
    })

    expect(result.current.expenseForm.department).toBe('Science')
    expect(result.current.expenseForm.amount).toBe('500')
    expect(result.current.expenseForm.description).toBe('Test lab items')

    act(() => {
      result.current.resetExpenseForm()
    })

    expect(result.current.expenseForm.department).toBe('')
    expect(result.current.expenseForm.amount).toBe('')
  })
})
