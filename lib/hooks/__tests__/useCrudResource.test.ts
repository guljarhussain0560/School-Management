import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCrudResource } from '../useCrudResource'
import * as apiClient from '@/lib/api-client'
import { logger } from '@/lib/logger'

vi.mock('@/lib/api-client')
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

interface TestUser {
  id: string
  name: string
  role: string
}

describe('useCrudResource Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches items on mount and populates state', async () => {
    const mockUsers: TestUser[] = [{ id: 'u1', name: 'Alice', role: 'ADMIN' }]
    vi.mocked(apiClient.apiGet).mockResolvedValue({ users: mockUsers } as any)

    const { result } = renderHook(() =>
      useCrudResource<TestUser>({
        baseEndpoint: '/api/users',
        resourceName: 'User',
      })
    )

    await waitFor(() => {
      expect(result.current.items.length).toBe(1)
      expect(result.current.items[0].name).toBe('Alice')
    })
  })

  it('handles fetch error and logs structured error', async () => {
    vi.mocked(apiClient.apiGet).mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() =>
      useCrudResource<TestUser>({
        baseEndpoint: '/api/users',
        resourceName: 'User',
      })
    )

    await waitFor(() => {
      expect(result.current.error).toBe('Unauthorized')
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Exception fetching User'),
        expect.anything()
      )
    })
  })

  it('creates an item and prepends to items array', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ users: [] } as any)
    vi.mocked(apiClient.apiPost).mockResolvedValue({
      user: { id: 'u2', name: 'Bob', role: 'TEACHER' },
    } as any)

    const { result } = renderHook(() =>
      useCrudResource<TestUser>({
        baseEndpoint: '/api/users',
        resourceName: 'User',
      })
    )

    await act(async () => {
      const created = await result.current.createItem({ name: 'Bob', role: 'TEACHER' })
      expect(created?.name).toBe('Bob')
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].id).toBe('u2')
  })

  it('deletes an item and removes from items array', async () => {
    const initialUsers: TestUser[] = [{ id: 'u3', name: 'Charlie', role: 'STUDENT' }]
    vi.mocked(apiClient.apiGet).mockResolvedValue({ users: initialUsers } as any)
    vi.mocked(apiClient.apiDelete).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() =>
      useCrudResource<TestUser>({
        baseEndpoint: '/api/users',
        resourceName: 'User',
      })
    )

    await waitFor(() => {
      expect(result.current.items.length).toBe(1)
    })

    await act(async () => {
      const success = await result.current.deleteItem('u3')
      expect(success).toBe(true)
    })

    expect(result.current.items.length).toBe(0)
  })
})
