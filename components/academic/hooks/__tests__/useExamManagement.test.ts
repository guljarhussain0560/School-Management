import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useExamManagement } from '../useExamManagement'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('useExamManagement hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getExams).mockResolvedValue({
      exams: [
        {
          id: 'ex-1',
          examName: 'Midterm Biology',
          examType: 'MIDTERM',
          subject: { id: 's-1', subjectName: 'Biology' },
          class: { id: 'c-1', className: 'Grade 9' },
          totalMarks: 100,
          passingMarks: 40,
          duration: 90,
          isActive: true,
          createdAt: '2026-08-01',
        },
      ],
    } as any)
    vi.mocked(apiClient.getSubjects).mockResolvedValue({
      subjects: [{ id: 's-1', subjectName: 'Biology' }],
    } as any)
    vi.mocked(apiClient.getClasses).mockResolvedValue({
      classes: [{ id: 'c-1', className: 'Grade 9' }],
    } as any)
  })

  it('fetches exams, subjects, and classes on mount', async () => {
    const { result } = renderHook(() => useExamManagement())

    await waitFor(() => {
      expect(result.current.exams.length).toBe(1)
      expect(result.current.subjects.length).toBe(1)
      expect(result.current.classes.length).toBe(1)
    })
  })

  it('handles exam creation and deletion', async () => {
    vi.mocked(apiClient.createExam).mockResolvedValue({ exam: {}, message: 'Success' } as any)
    vi.mocked(apiClient.deleteExam).mockResolvedValue({ message: 'Deleted' } as any)
    window.confirm = vi.fn().mockReturnValue(true)

    const { result } = renderHook(() => useExamManagement())

    await waitFor(() => expect(result.current.exams.length).toBe(1))

    await act(async () => {
      const ok = await result.current.handleCreateExam({ examName: 'Quiz 1' })
      expect(ok).toBe(true)
    })

    await act(async () => {
      const ok = await result.current.handleDeleteExam('ex-1')
      expect(ok).toBe(true)
    })

    expect(result.current.exams.length).toBe(0)
  })
})
