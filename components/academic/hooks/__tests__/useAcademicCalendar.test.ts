import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAcademicCalendar } from '../useAcademicCalendar'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useAcademicCalendar Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and provides academic events list and filter states', async () => {
    const mockEvents = [
      {
        id: 'cal-1',
        title: 'Independence Day',
        eventType: 'HOLIDAY',
        startDate: '2026-08-15',
        isAllDay: true,
        isRecurring: false,
        targetAudience: [],
        createdBy: 'admin',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    vi.mocked(apiClient.apiGet).mockImplementation(async (url) => {
      if (url.includes('/api/academic/calendar')) {
        return { events: mockEvents } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useAcademicCalendar())

    await waitFor(() => {
      expect(result.current.events.length).toBe(1)
    })

    expect(result.current.events[0].title).toBe('Independence Day')
  })

  it('deletes an event and refreshes data', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ events: [] } as any)
    vi.mocked(apiClient.apiDelete).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useAcademicCalendar())

    await act(async () => {
      await result.current.deleteEvent('cal-1')
    })

    expect(apiClient.apiDelete).toHaveBeenCalledWith(
      '/api/academic/calendar/cal-1',
      expect.objectContaining({ showSuccessToast: true })
    )
  })
})
