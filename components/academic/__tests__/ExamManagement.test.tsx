import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExamManagement from '../ExamManagement'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('ExamManagement Component', () => {
  const mockExams = [
    {
      id: 'ex-1',
      examName: 'Mathematics Midterm',
      examType: 'MIDTERM',
      subject: { id: 's-1', subjectName: 'Mathematics' },
      class: { id: 'c-1', className: 'Grade 10' },
      totalMarks: 100,
      passingMarks: 40,
      duration: 120,
      isActive: true,
      createdAt: '2026-08-01',
    },
  ]

  const mockSubjects = [{ id: 's-1', subjectName: 'Mathematics' }]
  const mockClasses = [{ id: 'c-1', className: 'Grade 10' }]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getExams).mockResolvedValue({ exams: mockExams } as any)
    vi.mocked(apiClient.getSubjects).mockResolvedValue({ subjects: mockSubjects } as any)
    vi.mocked(apiClient.getClasses).mockResolvedValue({ classes: mockClasses } as any)
  })

  it('renders exam management header and lists existing exams', async () => {
    render(<ExamManagement />)

    await waitFor(() => {
      expect(screen.getByText('Exam Management')).toBeDefined()
      expect(screen.getByText('Mathematics Midterm')).toBeDefined()
      expect(screen.getByText('Mathematics')).toBeDefined()
      expect(screen.getByText('Grade 10')).toBeDefined()
    })
  })

  it('filters exams based on search query', async () => {
    render(<ExamManagement />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Midterm')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText(/Search exams by name/i)
    fireEvent.change(searchInput, { target: { value: 'Physics' } })

    await waitFor(() => {
      expect(screen.queryByText('Mathematics Midterm')).toBeNull()
      expect(screen.getByText(/No exams found/i)).toBeDefined()
    })
  })
})
