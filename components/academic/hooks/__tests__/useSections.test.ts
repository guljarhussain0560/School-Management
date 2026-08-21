import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSections } from '../useSections'

global.fetch = vi.fn()

describe('useSections hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        grades: [{ id: 'g1', gradeName: 'Grade 10', gradeCode: '10' }],
        classes: [
          {
            id: 'sec-1',
            classCode: '10-A',
            sectionName: 'Section A',
            sectionType: 'LETTER',
            capacity: 40,
            isActive: true,
          },
        ],
      }),
    } as any)
  })

  it('fetches grades and sections on mount', async () => {
    const { result } = renderHook(() => useSections())

    expect(result.current.loading).toBe(true)
  })

  it('resets form state when resetForm is called', () => {
    const { result } = renderHook(() => useSections())

    act(() => {
      result.current.setFormData(prev => ({ ...prev, sectionName: 'New Section' }))
      result.current.resetForm()
    })

    expect(result.current.formData.sectionName).toBe('')
  })
})
