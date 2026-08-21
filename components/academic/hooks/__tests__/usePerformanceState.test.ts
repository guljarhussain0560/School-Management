import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePerformanceState } from '../usePerformanceState'

describe('usePerformanceState Hook', () => {
  it('manages filter and form states', () => {
    const { result } = renderHook(() => usePerformanceState())

    expect(result.current.performanceGradeFilter).toBe('all')
    expect(result.current.performanceSearch).toBe('')

    act(() => {
      result.current.setPerformanceGradeFilter('A')
      result.current.setPerformanceSearch('John')
      result.current.handleFormChange('studentName', 'John Doe')
    })

    expect(result.current.performanceGradeFilter).toBe('A')
    expect(result.current.performanceSearch).toBe('John')
    expect(result.current.performanceForm.studentName).toBe('John Doe')
  })
})
