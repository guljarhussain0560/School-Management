import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouteManagement } from '../RouteManagement'

vi.mock('@/lib/api-client', () => ({
  apiGet: vi.fn().mockResolvedValue({ routes: [] }),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}))

describe('RouteManagement Component', () => {
  it('renders title and add route action button', () => {
    render(<RouteManagement />)
    expect(screen.getByText('Route Management')).toBeDefined()
    expect(screen.getByText('Add Route')).toBeDefined()
  })
})
