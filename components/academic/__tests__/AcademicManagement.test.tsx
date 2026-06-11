import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import AcademicManagement from '../AcademicManagement'

describe('AcademicManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/academic/student-batches')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              batches: [
                { id: 'b1', batchName: '2026-2027 Cohort', academicYear: '2026-27', status: 'ACTIVE', startDate: '2026-06-01' },
              ],
            }),
        })
      }
      if (url.includes('/api/academic/classes')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              classes: [
                { id: 'c1', classCode: 'G10A', className: 'Grade 10-A', capacity: 35, _count: { students: 30, subjects: 6 } },
              ],
            }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            subjects: [{ id: 'sub1', subjectName: 'Mathematics', subjectCode: 'MATH101' }],
          }),
      })
    })
  })

  it('renders academic management overview and tabs', () => {
    render(<AcademicManagement />)
    expect(screen.getByText('Academic Roster & Coursework')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /classes/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /batches/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /subjects/i })).toBeInTheDocument()
  })
})
