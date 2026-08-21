import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStudentBatches } from '../useStudentBatches'

global.fetch = vi.fn()

describe('useStudentBatches hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        batches: [
          {
            id: 'b-1',
            batchCode: 'BAT001',
            batchName: '2026-2027 Cohort',
            academicYear: '2026-2027',
            startDate: '2026-06-01',
            status: 'ACTIVE',
            createdAt: '2026-08-20',
          },
        ],
      }),
    } as any)
  })

  it('fetches batches on mount', async () => {
    const { result } = renderHook(() => useStudentBatches())

    expect(result.current.loading).toBe(true)
  })

  it('resets form state when resetForm is called', () => {
    const { result } = renderHook(() => useStudentBatches())

    act(() => {
      result.current.setFormData(prev => ({ ...prev, batchName: 'New Batch' }))
      result.current.resetForm()
    })

    expect(result.current.formData.batchName).toBe('')
  })
})
