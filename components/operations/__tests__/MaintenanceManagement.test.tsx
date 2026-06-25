import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import MaintenanceManagement from '../MaintenanceManagement'

describe('MaintenanceManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/operations/maintenance/items')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                { id: 'item-1', name: 'Main AC Unit 3', status: 'OK', lastChecked: '2026-08-01' },
              ],
            }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            logs: [
              { id: 'log-1', facility: 'Chemistry Lab', status: 'OK', notes: 'Checked fume hood', createdAt: '2026-08-05' },
            ],
          }),
      })
    })
  })

  it('renders maintenance overview cards and tab sections', () => {
    render(<MaintenanceManagement />)
    expect(screen.getByText('Facility Maintenance & Operations')).toBeInTheDocument()
    expect(screen.getByText('Monitored Assets')).toBeInTheDocument()
    expect(screen.getByText('Total Work Logs')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /equipment/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /incident logs/i })).toBeInTheDocument()
  })
})
