import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStudents } from '../useStudents'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useStudents Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and provides students, classes, and batches list', async () => {
    const mockStudents = [
      {
        id: 'stu-1',
        studentId: 'STU-001',
        name: 'Harry Potter',
        status: 'ACTIVE',
      },
    ]

    vi.mocked(apiClient.apiGet).mockImplementation(async (url) => {
      if (url.includes('/api/students')) {
        return { students: mockStudents } as any
      }
      if (url.includes('/api/academic/classes')) {
        return { classes: [{ id: 'cls-1', className: 'Class 1-A' }] } as any
      }
      if (url.includes('/api/academic/student-batches')) {
        return { batches: [{ id: 'b-1', batchName: '2026-27' }] } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useStudents())

    await waitFor(() => {
      expect(result.current.students.length).toBe(1)
      expect(result.current.students[0].name).toBe('Harry Potter')
    })
  })

  it('creates student and refreshes list', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ students: [] } as any)
    vi.mocked(apiClient.apiPost).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useStudents())

    await act(async () => {
      await result.current.createStudent({
        name: 'Ron Weasley',
        email: 'ron@example.com',
      })
    })

    expect(apiClient.apiPost).toHaveBeenCalledWith(
      '/api/students',
      expect.objectContaining({ name: 'Ron Weasley' }),
      expect.objectContaining({ showSuccessToast: true })
    )
  })
})
