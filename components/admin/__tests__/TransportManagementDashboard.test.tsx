import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TransportManagementDashboard from '../TransportManagementDashboard'
import { RouteStatusManager } from '../transport/RouteStatusManager'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock subcomponents
vi.mock('../../transport/RouteManagement', () => ({
  default: () => <div data-testid="route-management">Route Management Component</div>,
}))
vi.mock('../../transport/BusManagement', () => ({
  default: () => <div data-testid="bus-management">Bus Management Component</div>,
}))
vi.mock('@/components/operations/MaintenanceManagement', () => ({
  default: () => <div data-testid="maintenance-management">Maintenance Component</div>,
}))

describe('TransportManagementDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiGet).mockResolvedValue({
      alerts: [
        { id: 'al-1', type: 'Weather', priority: 'HIGH', description: 'Heavy snowfall alert', status: 'ACTIVE' },
      ],
    } as any)
  })

  it('renders transport dashboard header and tab triggers', async () => {
    render(
      <TransportManagementDashboard
        activeSubSection="routes"
        setActiveSubSection={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Transport & Fleet Operations')).toBeDefined()
      expect(screen.getByTestId('route-management')).toBeDefined()
    })
  })

  it('RouteStatusManager renders routes and handles assignment form', async () => {
    const mockRoutes = [
      { id: 'A', status: 'On Time', delayReason: '', students: 25 },
      { id: 'B', status: 'Delayed', delayReason: 'Traffic', students: 30 },
    ]

    render(
      <RouteStatusManager
        busRoutes={mockRoutes}
        onUpdateStatus={vi.fn()}
        studentRouteForm={{ studentId: '', routeId: '' }}
        setStudentRouteForm={vi.fn()}
        onAssignStudent={vi.fn()}
      />
    )

    expect(screen.getByText('Live Bus Routes')).toBeDefined()
    expect(screen.getAllByText('Route A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Route B').length).toBeGreaterThan(0)
    expect(screen.getByText('Assign Student to Route')).toBeDefined()
  })
})
