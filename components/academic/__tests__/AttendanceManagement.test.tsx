import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AttendanceManagement from '../AttendanceManagement'

const mockStudents = [
  { id: 's1', studentId: 'STU-001', name: 'Alice Smith', rollNumber: '101', grade: 'Grade 10' },
  { id: 's2', studentId: 'STU-002', name: 'Bob Jones', rollNumber: '102', grade: 'Grade 10' },
]

describe('AttendanceManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/academic/attendance/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ students: mockStudents }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ attendanceRecords: [], pagination: { pages: 1, total: 0 } }),
      })
    })
  })

  it('renders correctly with tabs and grade selection', () => {
    render(<AttendanceManagement />)
    expect(screen.getByRole('heading', { name: 'Attendance Management' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /grade-wise attendance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /subject-wise attendance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /excel upload/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /view records/i })).toBeInTheDocument()
  })

  it('initializes attendance form state and button disability', async () => {
    render(<AttendanceManagement />)
    const recordButtons = screen.getAllByRole('button', { name: /record attendance/i })
    expect(recordButtons[0]).toBeDisabled()
  })

  it('renders tab triggers for navigation', async () => {
    render(<AttendanceManagement />)
    const uploadTab = screen.getByRole('tab', { name: /excel upload/i })
    expect(uploadTab).toBeInTheDocument()

    const recordsTab = screen.getByRole('tab', { name: /view records/i })
    expect(recordsTab).toBeInTheDocument()
  })
})
