import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AdmissionsManagementDashboard from '../AdmissionsManagementDashboard'

const mockStudents = [
  {
    id: 'stu-1',
    studentId: 'STU001',
    name: 'Emma Watson',
    email: 'emma@school.com',
    grade: 'Grade 10',
    rollNumber: '101',
    parentContact: '9876543210',
    status: 'ACCEPTED',
  },
  {
    id: 'stu-2',
    studentId: 'STU002',
    name: 'John Doe',
    email: 'john@school.com',
    grade: 'Grade 10',
    rollNumber: '102',
    parentContact: '9876543211',
    status: 'PENDING',
  },
]

describe('AdmissionsManagementDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          students: mockStudents,
          pagination: { totalCount: 2, totalPages: 1 },
        }),
    })
  })

  it('renders overview KPI cards and navigation tabs', async () => {
    const setActiveSubSection = vi.fn()
    render(
      <AdmissionsManagementDashboard
        activeSubSection="admissions-list"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText('Student Admissions & Enrollment')).toBeInTheDocument()
    expect(screen.getByText('Approved Admissions')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /admissions roster/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /new admission/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /bulk import/i })).toBeInTheDocument()
  })

  it('renders student registration form when activeSubSection is new-admission', () => {
    const setActiveSubSection = vi.fn()
    render(
      <AdmissionsManagementDashboard
        activeSubSection="new-admission"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText('Student Registration Application')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register student/i })).toBeInTheDocument()
  })

  it('renders bulk import section when activeSubSection is excel-upload', () => {
    const setActiveSubSection = vi.fn()
    render(
      <AdmissionsManagementDashboard
        activeSubSection="excel-upload"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText(/Batch Excel Student Import/i)).toBeInTheDocument()
  })
})
