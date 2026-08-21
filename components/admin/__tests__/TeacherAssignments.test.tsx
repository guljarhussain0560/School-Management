import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TeacherAssignments from '../TeacherAssignments'
import { logger } from '@/lib/logger'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('TeacherAssignments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders teacher assignments and header', async () => {
    const mockAssignments = [
      {
        id: 'ta-1',
        teacherId: 't-1',
        subjectId: 's-1',
        classId: 'c-1',
        teacher: { id: 't-1', name: 'Mr. Davis', email: 'davis@school.edu' },
        subject: { id: 's-1', subjectName: 'Physics', subjectCode: 'PHY101' },
        class: { id: 'c-1', className: 'Grade 10', classCode: 'G10' },
      },
    ]

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/academic/teacher-assignments')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ assignments: mockAssignments }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ users: [], subjects: [], classes: [] }),
      })
    })

    render(<TeacherAssignments />)

    await waitFor(() => {
      expect(screen.getByText('Teacher Assignments')).toBeDefined()
      expect(screen.getByText('Mr. Davis')).toBeDefined()
      expect(screen.getByText('Physics')).toBeDefined()
    })
  })

  it('invokes logger.error when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'))

    render(<TeacherAssignments />)

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
