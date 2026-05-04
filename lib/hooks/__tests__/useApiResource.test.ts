import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiResource } from '../useApiResource'

interface TestItem {
  id: string
  name: string
}

describe('useApiResource Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and populates resource data successfully', async () => {
    const mockData = [
      { id: '1', name: 'Item One' },
      { id: '2', name: 'Item Two' },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          items: mockData,
          pagination: { total: 2, totalPages: 1 },
        }),
    })

    const { result } = renderHook(() =>
      useApiResource<TestItem>({
        endpoint: '/api/test-resource',
      })
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0].name).toBe('Item One')
    expect(result.current.pagination.total).toBe(2)
    expect(result.current.isError).toBe(false)
  })

  it('handles API errors gracefully and updates error states', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const onErrorMock = vi.fn()

    const { result } = renderHook(() =>
      useApiResource<TestItem>({
        endpoint: '/api/failing-endpoint',
        onError: onErrorMock,
      })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBeDefined()
    expect(onErrorMock).toHaveBeenCalled()
  })

  it('supports mutating, adding, and removing items in memory', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [{ id: '1', name: 'Original Name' }],
          pagination: { total: 1, totalPages: 1 },
        }),
    })

    const { result } = renderHook(() =>
      useApiResource<TestItem>({
        endpoint: '/api/test-items',
      })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Mutate item
    act(() => {
      result.current.mutateItem('1', { name: 'Updated Name' })
    })
    expect(result.current.data[0].name).toBe('Updated Name')

    // Add item
    act(() => {
      result.current.addItem({ id: '2', name: 'New Item' })
    })
    expect(result.current.data).toHaveLength(2)
    expect(result.current.pagination.total).toBe(2)

    // Remove item
    act(() => {
      result.current.removeItem('1')
    })
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].id).toBe('2')
    expect(result.current.pagination.total).toBe(1)
  })
})
