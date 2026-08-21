import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FinancialDataForm from '../FinancialDataForm'
import * as apiClient from '@/lib/api-client'
import * as excelUtils from '@/lib/excel-utils'

vi.mock('@/lib/api-client')
vi.mock('@/lib/excel-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/excel-utils')>('@/lib/excel-utils')
  return {
    ...actual,
    downloadCsvTemplate: vi.fn(),
  }
})

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('FinancialDataForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.createFeeCollection).mockResolvedValue({ success: true } as any)
  })

  it('renders fee collection, payroll, and expense sections', () => {
    render(<FinancialDataForm />)

    expect(screen.getByText('Fee Collection Input')).toBeDefined()
    expect(screen.getByText('Payroll Management')).toBeDefined()
    expect(screen.getByText('Department Payroll Summary')).toBeDefined()
  })

  it('triggers downloadCsvTemplate when Download Template is clicked', () => {
    render(<FinancialDataForm />)

    const downloadButtons = screen.getAllByText('Download Template')
    expect(downloadButtons.length).toBeGreaterThan(0)

    fireEvent.click(downloadButtons[0])
    expect(excelUtils.downloadCsvTemplate).toHaveBeenCalledWith('payroll', 'payroll_template.csv')
  })

  it('submits fee payment successfully through createFeeCollection', async () => {
    render(<FinancialDataForm />)

    const amountInputs = screen.getAllByPlaceholderText('Enter amount')
    fireEvent.change(amountInputs[0], { target: { value: '15000' } })

    const submitBtn = screen.getByText('Record Payment')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(apiClient.createFeeCollection).toHaveBeenCalled()
    })
  })
})
