import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StudentManagement } from '../StudentManagement'

vi.mock('@/lib/api-client', () => ({
  apiGet: vi.fn().mockResolvedValue({ students: [], classes: [], batches: [] }),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

describe('StudentManagement Component', () => {
  it('renders student directory title and enroll button', () => {
    render(<StudentManagement />)
    expect(screen.getByText('Student Directory')).toBeDefined()
    expect(screen.getByText('Add Student')).toBeDefined()
  })
})
