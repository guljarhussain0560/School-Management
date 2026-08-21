import { describe, it, expect, vi } from 'vitest'
import { EXCEL_TEMPLATES, downloadExcelTemplate, downloadCsvTemplate } from '../excel-utils'


import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

describe('excel-utils template validation and transforms', () => {
  it('contains valid column definitions for students template', () => {
    const template = EXCEL_TEMPLATES.students
    expect(template).toBeDefined()
    expect(template.columns.length).toBeGreaterThan(5)

    const nameCol = template.columns.find((c) => c.key === 'name')
    expect(nameCol?.required).toBe(true)
    expect(nameCol?.type).toBe('string')

    const transportCol = template.columns.find((c) => c.key === 'transportRequired')
    expect(transportCol?.transform).toBeDefined()
    if (transportCol?.transform) {
      expect(transportCol.transform('Yes')).toBe(true)
      expect(transportCol.transform('No')).toBe(false)
    }
  })

  it('contains valid column definitions for employees template', () => {
    const template = EXCEL_TEMPLATES.employees
    expect(template).toBeDefined()

    const salaryCol = template.columns.find((c) => c.key === 'salary')
    expect(salaryCol?.required).toBe(true)
    expect(salaryCol?.type).toBe('number')
  })

  it('contains valid column definitions for feeStructures template', () => {
    const template = EXCEL_TEMPLATES.feeStructures
    expect(template).toBeDefined()

    const amountCol = template.columns.find((c) => c.key === 'amount')
    expect(amountCol?.required).toBe(true)
  })

  it('contains valid column definitions for routes and buses templates', () => {
    expect(EXCEL_TEMPLATES.routes).toBeDefined()
    expect(EXCEL_TEMPLATES.buses).toBeDefined()

    const routeNameCol = EXCEL_TEMPLATES.routes.columns.find((c) => c.key === 'routeName')
    expect(routeNameCol?.required).toBe(true)

    const busNumberCol = EXCEL_TEMPLATES.buses.columns.find((c) => c.key === 'busNumber')
    expect(busNumberCol?.required).toBe(true)
  })

  it('executes downloadExcelTemplate with valid template', () => {
    downloadExcelTemplate('students')
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Student Registration Template downloaded')
    )
  })


  it('generates valid CSV format with downloadCsvTemplate for payroll', () => {
    const csv = downloadCsvTemplate('payroll')
    expect(csv).toContain('Employee ID')
    expect(csv).toContain('Basic Salary')
    expect(csv).toContain('EMP001')
  })

  it('generates valid CSV format with downloadCsvTemplate for student admission', () => {
    const csv = downloadCsvTemplate('student_admission')
    expect(csv).toContain('Name')
    expect(csv).toContain('Grade')
    expect(csv).toContain('Parent Name')
  })
})

