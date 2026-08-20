import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdmissions, initialStudentForm } from '../useAdmissions'

global.fetch = vi.fn()

describe('useAdmissions Custom Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ students: [], pagination: { totalPages: 1, totalCount: 0 } }),
    } as any)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAdmissions())

    expect(result.current.studentForm).toEqual(initialStudentForm)
    expect(result.current.activeFormSection).toBe('basic')
    expect(result.current.isDialogOpen).toBe(false)
  })

  it('updates form fields via handleFormChange', () => {
    const { result } = renderHook(() => useAdmissions())

    act(() => {
      result.current.handleFormChange('name', 'Alice Smith')
    })

    expect(result.current.studentForm.name).toBe('Alice Smith')
  })

  it('resets form data via setStudentForm', () => {
    const { result } = renderHook(() => useAdmissions())

    act(() => {
      result.current.handleFormChange('name', 'Alice Smith')
      result.current.setStudentForm(initialStudentForm)
    })

    expect(result.current.studentForm).toEqual(initialStudentForm)
  })
})
