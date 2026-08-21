import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFeeCollections } from '../useFeeCollections'
import * as apiClient from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useFeeCollections Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and provides fee collections, students, and fee structures', async () => {
    const mockCollections = [
      {
        id: 'fc-1',
        feeId: 'FEE202601',
        studentId: 'stu-1',
        amount: 250,
        paymentMode: 'CASH',
        collectedBy: 'admin',
        date: '2026-01-15',
        student: { id: 'stu-1', name: 'Charlie Brown', studentId: 'STU01' },
      },
    ]

    vi.mocked(apiClient.apiGet).mockImplementation(async (url) => {
      if (url.includes('/api/financial/fee-collections')) {
        return { feeCollections: mockCollections } as any
      }
      if (url.includes('/api/students')) {
        return { students: [{ id: 'stu-1', name: 'Charlie Brown', studentId: 'STU01' }] } as any
      }
      if (url.includes('/api/financial/fee-structures')) {
        return { feeStructures: [{ id: 'fs-1', name: 'Tuition', feeCode: 'FEE01', category: 'TUITION', amount: 250 }] } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useFeeCollections())

    await waitFor(() => {
      expect(result.current.feeCollections.length).toBe(1)
      expect(result.current.totalCollected).toBe(250)
    })
  })

  it('records fee collection successfully', async () => {
    vi.mocked(apiClient.apiGet).mockResolvedValue({ feeCollections: [] } as any)
    vi.mocked(apiClient.apiPost).mockResolvedValue({ success: true } as any)

    const { result } = renderHook(() => useFeeCollections())

    await act(async () => {
      await result.current.collectFee({
        studentId: 'stu-1',
        amount: 100,
        paymentMode: 'CASH',
      })
    })

    expect(apiClient.apiPost).toHaveBeenCalledWith(
      '/api/financial/fee-collection',
      expect.objectContaining({ studentId: 'stu-1', amount: 100 }),
      expect.objectContaining({ showSuccessToast: true })
    )
  })
})
