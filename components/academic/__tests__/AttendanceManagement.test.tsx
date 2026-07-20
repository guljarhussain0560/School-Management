import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import AttendanceManagement from '../AttendanceManagement'

const mockStudents = [
  { id: 's1', studentId: 'STU001', name: 'Alice Smith', rollNumber: '1', grade: 'Grade 10' },
  { id: 's2', studentId: 'STU002', name: 'Bob Jones', rollNumber: '2', grade: 'Grade 10' },
]

describe('AttendanceManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ students: mockStudents }),
    })
  })

  it('renders attendance management header and class register', () => {
    render(<AttendanceManagement />)
    expect(screen.getByText('Student Attendance Management')).toBeInTheDocument()
    expect(screen.getByText('Class Attendance Register')).toBeInTheDocument()
    expect(screen.getByText('Mark All Present')).toBeInTheDocument()
    expect(screen.getByText('Mark All Absent')).toBeInTheDocument()
  })
})
