import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeeCollectionManagement } from '../FeeCollectionManagement'

vi.mock('@/lib/api-client', () => ({
  apiGet: vi.fn().mockResolvedValue({ feeCollections: [], students: [], feeStructures: [] }),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

describe('FeeCollectionManagement Component', () => {
  it('renders title and summary stats cards correctly', () => {
    render(<FeeCollectionManagement />)
    expect(screen.getByText('Fee Collection Management')).toBeDefined()
    expect(screen.getByText('Collect Fee')).toBeDefined()
    expect(screen.getByText('Total Collected')).toBeDefined()
    expect(screen.getByText('Enrolled Students')).toBeDefined()
  })
})
