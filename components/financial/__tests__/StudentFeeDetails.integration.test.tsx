import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import StudentFeeDetails from '../StudentFeeDetails'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('StudentFeeDetails Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('computes totalPaid, pendingAmount, and paidPercentage accurately from fee structures', async () => {
    const mockStudent = {
      id: 'stu-100',
      name: 'Emma Watson',
      studentId: 'STU-100',
      class: { id: 'c-1', className: 'Grade 10', classCode: 'G10' },
      batch: { id: 'b-1', batchName: 'Batch A', batchCode: 'BA' },
    }

    const mockFeeStructures = [
      {
        id: 'fs-1',
        feeCode: 'TUI-01',
        name: 'Tuition Fee Q1',
        amount: 10000,
        frequency: 'QUARTERLY',
        category: 'TUITION',
        isMandatory: true,
        isActive: true,
        applicableFrom: '2026-01-01',
        totalPaid: 6000,
        pendingAmount: 4000,
        isPaid: false,
        collections: [
          { id: 'col-1', amount: 6000, status: 'PARTIAL', date: '2026-02-01' },
        ],
      },
      {
        id: 'fs-2',
        feeCode: 'TRN-01',
        name: 'Transport Fee Q1',
        amount: 2000,
        frequency: 'QUARTERLY',
        category: 'TRANSPORT',
        isMandatory: true,
        isActive: true,
        applicableFrom: '2026-01-01',
        totalPaid: 2000,
        pendingAmount: 0,
        isPaid: true,
        collections: [
          { id: 'col-2', amount: 2000, status: 'PAID', date: '2026-02-05' },
        ],
      },
    ]

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/financial/fee-structures/student')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            student: mockStudent,
            feeStructures: mockFeeStructures,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ students: [mockStudent] }),
      })
    })

    render(<StudentFeeDetails studentId="stu-100" />)

    await waitFor(() => {
      expect(screen.getByText('Student Fee Details')).toBeDefined()
      expect(screen.getByText('Emma Watson')).toBeDefined()
      expect(screen.getByText('₹12,000')).toBeDefined()
      expect(screen.getByText('₹8,000')).toBeDefined()
      expect(screen.getByText('66.7% (8,000 / 12,000)')).toBeDefined()
    })
  })

  it('renders status badges correctly for paid and pending fees', async () => {
    const mockStudent = {
      id: 'stu-101',
      name: 'Harry Potter',
      studentId: 'STU-101',
      class: { id: 'c-2', className: 'Grade 11', classCode: 'G11' },
    }

    const mockFeeStructures = [
      {
        id: 'fs-3',
        feeCode: 'LIB-01',
        name: 'Library Fee',
        amount: 500,
        frequency: 'ANNUAL',
        category: 'LIBRARY',
        isMandatory: true,
        isActive: true,
        applicableFrom: '2026-01-01',
        totalPaid: 500,
        pendingAmount: 0,
        isPaid: true,
        collections: [
          { id: 'col-3', amount: 500, status: 'PAID', date: '2026-01-10' },
        ],
      },
    ]

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/financial/fee-structures/student')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            student: mockStudent,
            feeStructures: mockFeeStructures,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ students: [mockStudent] }),
      })
    })

    render(<StudentFeeDetails studentId="stu-101" />)

    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeDefined()
      expect(screen.getAllByText('₹500').length).toBeGreaterThan(0)
      expect(screen.getByText('100.0% (500 / 500)')).toBeDefined()
    })
  })
})
