import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import OperationsTransport from '../OperationsTransport'

describe('OperationsTransport Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/transport/buses')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              buses: [
                { id: 'b-1', busNumber: 'BUS-101', busName: 'Yellow Express', capacity: 40, status: 'ACTIVE', driverName: 'Rajesh' },
              ],
            }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            routes: [
              { id: 'r-1', routeName: 'North Campus Route', status: 'ON_TIME', students: [] },
            ],
          }),
      })
    })
  })

  it('renders transport dashboard tabs and fleet list', () => {
    render(<OperationsTransport />)
    expect(screen.getByText('Transportation & Fleet Operations')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /vehicle fleet/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /transit routes/i })).toBeInTheDocument()
  })
})
