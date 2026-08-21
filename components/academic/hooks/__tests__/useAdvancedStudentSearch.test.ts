import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdvancedStudentSearch } from '../useAdvancedStudentSearch'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('useAdvancedStudentSearch hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiGet).mockImplementation((url: string) => {
      if (url.includes('/api/academic/batches')) return Promise.resolve({ batches: [{ id: 'b1', batchName: '2026' }] } as any)
      if (url.includes('/api/academic/grades')) return Promise.resolve({ grades: [{ id: 'g1', gradeName: 'Grade 10' }] } as any)
      if (url.includes('/api/academic/sections')) return Promise.resolve({ sections: [{ id: 's1', sectionName: 'A' }] } as any)
      if (url.includes('/api/academic/students')) {
        return Promise.resolve({
          students: [
            {
              id: 'stu-1',
              studentId: 'GW001',
              name: 'Harry',
              rollNumber: 'R1',
              age: 15,
              status: 'ACTIVE',
              class: { sectionName: 'A' },
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        } as any)
      }
      return Promise.resolve({} as any)
    })
  })

  it('fetches dropdown options and initial student list on mount', async () => {
    const { result } = renderHook(() => useAdvancedStudentSearch())

    await waitFor(() => {
      expect(result.current.batches.length).toBe(1)
      expect(result.current.grades.length).toBe(1)
      expect(result.current.students.length).toBe(1)
      expect(result.current.hasSearched).toBe(true)
    })
  })

  it('resets filters correctly', () => {
    const { result } = renderHook(() => useAdvancedStudentSearch())

    act(() => {
      result.current.setSearchFilters({
        searchTerm: 'Test',
        batchId: 'b1',
        gradeId: 'g1',
        sectionId: 's1',
        status: 'ACTIVE',
      })
    })

    expect(result.current.searchFilters.searchTerm).toBe('Test')

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.searchFilters.searchTerm).toBe('')
    expect(result.current.searchFilters.batchId).toBe('all')
  })
})
