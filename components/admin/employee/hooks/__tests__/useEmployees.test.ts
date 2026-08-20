import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEmployees, initialEmployeeForm } from '../useEmployees'

global.fetch = vi.fn()

describe('useEmployees Custom Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ employees: [], pagination: { totalPages: 1, totalCount: 0 } }),
    } as any)
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useEmployees())

    expect(result.current.formData).toEqual(initialEmployeeForm)
    expect(result.current.department).toBe('all')
    expect(result.current.search).toBe('')
  })

  it('updates form field values via handleFormChange', () => {
    const { result } = renderHook(() => useEmployees())

    act(() => {
      result.current.handleFormChange('name', 'Robert Johnson')
      result.current.handleFormChange('department', 'ACADEMIC')
    })

    expect(result.current.formData.name).toBe('Robert Johnson')
    expect(result.current.formData.department).toBe('ACADEMIC')
  })

  it('opens and configures dialogs properly', () => {
    const { result } = renderHook(() => useEmployees())

    act(() => {
      result.current.openCreateDialog()
    })

    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.editingEmployee).toBeNull()
  })
})
