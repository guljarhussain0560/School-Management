import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import FinancialManagementDashboard from '../FinancialManagementDashboard'

describe('FinancialManagementDashboard Component', () => {
  it('renders overview KPI cards and navigation tabs', () => {
    const setActiveSubSection = vi.fn()
    render(
      <FinancialManagementDashboard
        activeSubSection="fee-collection"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText('Institutional Financial Management')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Fees Collected')).toBeInTheDocument()
    expect(screen.getByText('Monthly Payroll')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /fee collection/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /fee structure/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /staff payroll/i })).toBeInTheDocument()
  })

  it('renders payroll sub-section when activeSubSection is payroll', () => {
    const setActiveSubSection = vi.fn()
    render(
      <FinancialManagementDashboard
        activeSubSection="payroll"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText(/Generate Staff Payroll & Salary Slip/i)).toBeInTheDocument()
  })

  it('renders fee collection sub-section when activeSubSection is fee-collection', () => {
    const setActiveSubSection = vi.fn()
    render(
      <FinancialManagementDashboard
        activeSubSection="fee-collection"
        setActiveSubSection={setActiveSubSection}
      />
    )

    expect(screen.getByText(/Collect Student Fee/i)).toBeInTheDocument()
  })
})
