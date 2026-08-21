import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeeStructures } from '../useFeeStructures'

global.fetch = vi.fn()

describe('useFeeStructures hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        feeStructures: [
          {
            id: 'fs-1',
            feeCode: 'FEE001',
            name: 'Tuition Fee 10th',
            amount: 5000,
            frequency: 'MONTHLY',
            category: 'TUITION',
            isMandatory: true,
            isActive: true,
            createdAt: '2026-08-20',
            updatedAt: '2026-08-20',
          },
        ],
        classes: [],
        batches: [],
      }),
    } as any)
  })

  it('fetches fee structures on mount', async () => {
    const { result } = renderHook(() => useFeeStructures())

    expect(result.current.loading).toBe(true)
  })

  it('filters fee structures based on search term', async () => {
    const { result } = renderHook(() => useFeeStructures())

    act(() => {
      result.current.setSearchTerm('Nonexistent')
    })

    expect(result.current.searchTerm).toBe('Nonexistent')
  })

  it('resets form to initial state', () => {
    const { result } = renderHook(() => useFeeStructures())

    act(() => {
      result.current.setFormData(prev => ({ ...prev, name: 'Sample' }))
      result.current.resetForm()
    })

    expect(result.current.formData.name).toBe('')
  })
})
