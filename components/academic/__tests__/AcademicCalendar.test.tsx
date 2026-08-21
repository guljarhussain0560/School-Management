import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AcademicCalendar } from '../AcademicCalendar'

vi.mock('@/lib/api-client', () => ({
  apiGet: vi.fn().mockResolvedValue({ events: [] }),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

describe('AcademicCalendar Component', () => {
  it('renders title and add event button correctly', () => {
    render(<AcademicCalendar />)
    expect(screen.getByText('Academic Calendar')).toBeDefined()
    expect(screen.getByText('Add Event')).toBeDefined()
  })
})
