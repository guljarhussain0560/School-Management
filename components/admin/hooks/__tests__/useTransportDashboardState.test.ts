import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTransportDashboardState } from '../useTransportDashboardState'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('useTransportDashboardState hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.apiGet).mockResolvedValue({
      alerts: [
        { id: 'al-1', type: 'Weather', priority: 'HIGH', description: 'Storm alert', status: 'ACTIVE' },
      ],
    } as any)
  })

  it('initializes routes and loads safety alerts', async () => {
    const { result } = renderHook(() => useTransportDashboardState())

    await waitFor(() => {
      expect(result.current.busRoutes.length).toBe(3)
      expect(result.current.safetyAlerts.length).toBe(1)
    })
  })

  it('updates route status successfully', async () => {
    vi.mocked(apiClient.apiPut).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useTransportDashboardState())

    await act(async () => {
      const ok = await result.current.handleRouteStatusUpdate('A', 'Delayed', 'Engine trouble')
      expect(ok).toBe(true)
    })

    expect(result.current.busRoutes[0].status).toBe('Delayed')
    expect(result.current.busRoutes[0].delayReason).toBe('Engine trouble')
  })
})
