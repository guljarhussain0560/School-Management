import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardOverview from '../DashboardOverview'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('DashboardOverview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiGet).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/stats/students')) return Promise.resolve({ count: 1200, attendanceRate: 94, recentAdmissions: 25 } as any)
      if (url.includes('/api/dashboard/stats/revenue')) return Promise.resolve({ total: 4500000, collectionRate: 92 } as any)
      if (url.includes('/api/dashboard/stats/buses')) return Promise.resolve({ active: 18 } as any)
      if (url.includes('/api/dashboard/stats/employees')) return Promise.resolve({ count: 85 } as any)
      if (url.includes('/api/dashboard/activities')) {
        return Promise.resolve({
          activities: [
            { id: '1', type: 'admission', message: 'New student enrolled', timestamp: '5m ago', status: 'success' },
          ],
          pendingTasks: 3,
        } as any)
      }
      return Promise.resolve({} as any)
    })
  })

  it('renders stats, metrics, quick actions, and recent activities', async () => {
    render(<DashboardOverview />)

    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeDefined()
      expect(screen.getByText('1,200')).toBeDefined()
      expect(screen.getByText('Total Revenue')).toBeDefined()
      expect(screen.getByText('₹4,500,000')).toBeDefined()
      expect(screen.getByText('Active Buses')).toBeDefined()
      expect(screen.getByText('18')).toBeDefined()
      expect(screen.getByText('Employees')).toBeDefined()
      expect(screen.getByText('85')).toBeDefined()
      expect(screen.getByText('New student enrolled')).toBeDefined()
      expect(screen.getByText('Quick Actions')).toBeDefined()
    })
  })
})
