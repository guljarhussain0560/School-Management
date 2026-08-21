import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdvancedStudentSearch from '../AdvancedStudentSearch'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('AdvancedStudentSearch Component', () => {
  const mockStudents = [
    {
      id: 'stu-1',
      studentId: 'GW26001',
      name: 'Hermione Granger',
      rollNumber: 'R101',
      email: 'hermione@hogwarts.edu',
      age: 15,
      status: 'ACTIVE',
      parentContact: '9876543210',
      class: {
        id: 'c-1',
        sectionName: 'A',
        sectionType: 'STANDARD',
        classCode: 'G10A',
        grade: { id: 'g-1', gradeName: 'Grade 10', gradeCode: 'G10', gradeLevel: 10 },
        batch: { id: 'b-1', batchName: 'Batch 2026', academicYear: '2026-27' },
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiGet).mockImplementation((url: string) => {
      if (url.includes('/api/academic/batches')) return Promise.resolve({ batches: [] } as any)
      if (url.includes('/api/academic/grades')) return Promise.resolve({ grades: [] } as any)
      if (url.includes('/api/academic/sections')) return Promise.resolve({ sections: [] } as any)
      if (url.includes('/api/academic/students')) {
        return Promise.resolve({
          students: mockStudents,
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        } as any)
      }
      return Promise.resolve({} as any)
    })
  })

  it('renders search directory and displays loaded student rows', async () => {
    render(<AdvancedStudentSearch />)

    await waitFor(() => {
      expect(screen.getByText('Advanced Student Search')).toBeDefined()
      expect(screen.getByText('Hermione Granger')).toBeDefined()
      expect(screen.getByText('GW26001')).toBeDefined()
      expect(screen.getByText('R101')).toBeDefined()
    })
  })

  it('executes search when keyword input changes and search is triggered', async () => {
    render(<AdvancedStudentSearch />)

    await waitFor(() => {
      expect(screen.getByText('Hermione Granger')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText(/Search by name, roll no/i)
    fireEvent.change(searchInput, { target: { value: 'Hermione' } })

    await waitFor(() => {
      const btn = screen.queryByRole('button', { name: /Search Students/i })
      expect(btn).not.toBeNull()
    })

    const searchButton = screen.getByRole('button', { name: /Search Students/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(apiClient.apiGet).toHaveBeenCalledWith(
        expect.stringContaining('search=Hermione'),
        expect.anything()
      )
    })
  })
})
