import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSchoolManagement } from '../useSchoolManagement'

global.fetch = vi.fn()

describe('useSchoolManagement hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        profile: {
          id: 'sch-1',
          schoolName: 'Greenwood High',
          schoolCode: 'GWH001',
          email: 'admin@greenwood.edu',
        },
        settings: {
          academicYear: '2026-2027',
        },
      }),
    } as any)
  })

  it('fetches profile and settings on mount', async () => {
    const { result } = renderHook(() => useSchoolManagement())

    expect(result.current.loading).toBe(true)
    expect(result.current.activeTab).toBe('profile')
  })

  it('switches tabs correctly', () => {
    const { result } = renderHook(() => useSchoolManagement())

    act(() => {
      result.current.setActiveTab('settings')
    })

    expect(result.current.activeTab).toBe('settings')
  })
})
