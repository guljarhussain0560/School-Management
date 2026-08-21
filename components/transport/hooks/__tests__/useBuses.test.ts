import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBuses } from '../useBuses'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useBuses Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and provides bus fleet and routes', async () => {
    const mockBuses = [
      {
        id: 'bus-1',
        busNumber: 'BUS-01',
        driverName: 'Robert Vance',
        driverPhone: '555-1234',
        capacity: 40,
        status: 'ACTIVE' as const,
      },
    ]

    vi.mocked(apiClient.apiGet).mockImplementation(async (url) => {
      if (url.includes('/api/transport/buses')) {
        return { buses: mockBuses } as any
      }
      if (url.includes('/api/transport/routes')) {
        return { routes: [{ id: 'rt-1', routeName: 'Route North' }] } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useBuses())

    await waitFor(() => {
      expect(result.current.buses.length).toBe(1)
      expect(result.current.buses[0].busNumber).toBe('BUS-01')
    })
  })

  it('creates a bus and refreshes fleet data', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ buses: [] } as any)
    vi.mocked(apiClient.apiPost).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useBuses())

    await act(async () => {
      await result.current.createBus({
        busNumber: 'BUS-02',
        driverName: 'Dwight Schrute',
        driverPhone: '555-5678',
        capacity: 35,
      })
    })

    expect(apiClient.apiPost).toHaveBeenCalledWith(
      '/api/transport/buses',
      expect.objectContaining({ busNumber: 'BUS-02' }),
      expect.objectContaining({ showSuccessToast: true })
    )
  })
})
