import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import AcademicManagementDashboard from '../AcademicManagementDashboard'

describe('AcademicManagementDashboard Component', () => {
  it('renders academic dashboard navigation tabs and sections', () => {
    const setActiveSubSection = vi.fn()
    render(
      <AcademicManagementDashboard
        activeSubSection="academics"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText('Academic Operations & Curriculum Management')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /classes & batches/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /curriculum/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /exams & grading/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /performance/i })).toBeInTheDocument()
    expect(screen.getAllByRole('tab', { name: /calendar/i })[0]).toBeInTheDocument()
  })

  it('renders performance section when activeSubSection is performance', () => {
    const setActiveSubSection = vi.fn()
    render(
      <AcademicManagementDashboard
        activeSubSection="performance"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText(/Record Student Academic Performance & Marks/i)).toBeInTheDocument()
  })
})
