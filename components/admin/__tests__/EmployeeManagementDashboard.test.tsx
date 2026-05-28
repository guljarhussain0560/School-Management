import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import EmployeeManagementDashboard from '../EmployeeManagementDashboard'

const mockEmployees = [
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    name: 'Dr. Alan Turing',
    email: 'alan.turing@school.edu',
    department: 'Teaching',
    position: 'Head of Computer Science',
    salary: 75000,
    status: 'ACTIVE',
    dateOfJoining: '2024-01-10',
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    name: 'Ada Lovelace',
    email: 'ada.lovelace@school.edu',
    department: 'Teaching',
    position: 'Mathematics Professor',
    salary: 72000,
    status: 'ON_LEAVE',
    dateOfJoining: '2024-02-15',
  },
]

describe('EmployeeManagementDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          employees: mockEmployees,
          pagination: { totalCount: 2, totalPages: 1 },
        }),
    })
  })

  it('renders employee summary overview cards and table correctly', async () => {
    const setActiveSubSection = vi.fn()
    render(
      <EmployeeManagementDashboard
        activeSubSection="employee-list"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText('Faculty & Human Resources Management')).toBeInTheDocument()
    expect(screen.getByText('Total Staff')).toBeInTheDocument()
    expect(screen.getByText('Active Staff')).toBeInTheDocument()
    expect(screen.getByText('On Leave')).toBeInTheDocument()
    expect(screen.getByText('Monthly Payroll')).toBeInTheDocument()
    expect(screen.getByText('Faculty & Staff Directory')).toBeInTheDocument()
  })

  it('opens create employee modal when clicking Add Employee', async () => {
    const setActiveSubSection = vi.fn()
    render(
      <EmployeeManagementDashboard
        activeSubSection="employee-list"
        setActiveSubSection={setActiveSubSection}
      />
    )

    const addButton = screen.getByRole('button', { name: /add employee/i })
    fireEvent.click(addButton)

    expect(screen.getByText('Register New Faculty / Staff Member')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })
})
