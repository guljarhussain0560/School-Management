import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BusManagement } from '../BusManagement'

vi.mock('@/lib/api-client', () => ({
  apiGet: vi.fn().mockResolvedValue({ buses: [], routes: [] }),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

describe('BusManagement Component', () => {
  it('renders title and add bus action button', () => {
    render(<BusManagement />)
    expect(screen.getByText('Bus Fleet Management')).toBeDefined()
    expect(screen.getByText('Add Bus')).toBeDefined()
  })
})
