import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdmissionsForm from '../AdmissionsForm'
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

describe('AdmissionsForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiPost).mockResolvedValue({ success: true } as any)
  })

  it('renders student onboarding, batch admission, and applications', () => {
    render(<AdmissionsForm />)

    expect(screen.getByText('Student Onboarding Form')).toBeDefined()
    expect(screen.getByText('Batch Upload')).toBeDefined()
    expect(screen.getByText('Recent Admissions')).toBeDefined()
  })



  it('triggers downloadCsvTemplate when Download Template is clicked', () => {
    render(<AdmissionsForm />)

    const downloadButtons = screen.getAllByText('Download Template')
    expect(downloadButtons.length).toBeGreaterThan(0)

    fireEvent.click(downloadButtons[0])
    expect(excelUtils.downloadCsvTemplate).toHaveBeenCalledWith('student_admission', 'student_admission_template.csv')
  })

  it('submits student onboarding form via apiPost', async () => {
    const { container } = render(<AdmissionsForm />)

    const nameInput = screen.getByPlaceholderText("Enter student's full name")
    fireEvent.change(nameInput, { target: { value: 'Neville Longbottom' } })

    const ageInput = screen.getByPlaceholderText('Age')
    fireEvent.change(ageInput, { target: { value: '15' } })

    const form = container.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(apiClient.apiPost).toHaveBeenCalledWith(
        '/api/academic/students',
        expect.objectContaining({
          name: 'Neville Longbottom',
          age: 15,
        }),
        expect.any(Object)
      )
    })
  })
})
