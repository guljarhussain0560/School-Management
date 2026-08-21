import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouteManagement } from '../useRouteManagement'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useRouteManagement Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and returns routes list', async () => {
    const mockRoutes = [
      {
        id: 'rt-1',
        routeName: 'Route 101',
        startLocation: 'School',
        endLocation: 'Downtown',
        isActive: true,
      },
    ]

    vi.mocked(apiClient.apiGet).mockResolvedValue({ routes: mockRoutes } as any)

    const { result } = renderHook(() => useRouteManagement())

    await waitFor(() => {
      expect(result.current.routes.length).toBe(1)
      expect(result.current.routes[0].routeName).toBe('Route 101')
    })
  })

  it('creates route and triggers refetch', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ routes: [] } as any)
    vi.mocked(apiClient.apiPost).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useRouteManagement())

    await act(async () => {
      await result.current.createRoute({ routeName: 'New Route' })
    })

    expect(apiClient.apiPost).toHaveBeenCalledWith(
      '/api/transport/routes',
      expect.objectContaining({ routeName: 'New Route' }),
      expect.objectContaining({ showSuccessToast: true })
    )
  })
})
