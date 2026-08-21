import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAcademicView } from '../useAcademicView'

global.fetch = vi.fn()

describe('useAcademicView hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ students: [{ id: 's1', name: 'Alice' }], assignments: [], progress: [] }),
    } as any)
  })

  it('initializes with default tab and empty states', async () => {
    const { result } = renderHook(() => useAcademicView())

    expect(result.current.activeTab).toBe('performance')
    expect(result.current.showPerformanceForm).toBe(false)
  })

  it('updates tab when setActiveTab is called', () => {
    const { result } = renderHook(() => useAcademicView())

    act(() => {
      result.current.setActiveTab('attendance')
    })

    expect(result.current.activeTab).toBe('attendance')
  })

  it('toggles student attendance correctly', async () => {
    const { result } = renderHook(() => useAcademicView())

    act(() => {
      result.current.setAttendanceForm({
        date: '2026-08-21',
        students: [
          { id: 's1', name: 'Alice', present: true },
          { id: 's2', name: 'Bob', present: true },
        ],
      })
    })

    act(() => {
      result.current.toggleStudentAttendance('s1')
    })

    expect(result.current.attendanceForm.students[0].present).toBe(false)
    expect(result.current.attendanceForm.students[1].present).toBe(true)
  })
})
