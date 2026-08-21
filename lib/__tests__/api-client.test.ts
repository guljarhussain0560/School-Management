import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest, apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api-client'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

global.fetch = vi.fn()

describe('api-client utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs successful GET request and returns JSON data', async () => {
    const mockData = { id: 1, name: 'Physics' }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    } as any)

    const result = await apiGet('/api/academic/subjects')

    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith('/api/academic/subjects', expect.objectContaining({ method: 'GET' }))
  })

  it('performs successful POST request with body and success toast', async () => {
    const payload = { title: 'Chapter 1 Assignment' }
    const responseData = { id: 'asg-1', ...payload }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => responseData,
    } as any)

    const result = await apiPost('/api/academic/assignments', payload, {
      showSuccessToast: true,
      successMessage: 'Assignment created successfully',
    })

    expect(result).toEqual(responseData)
    expect(toast.success).toHaveBeenCalledWith('Assignment created successfully')
  })

  it('handles 400 bad request error with error toast and throws ApiError', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid payload submitted' }),
    } as any)

    await expect(apiPost('/api/students', {})).rejects.toThrow(ApiError)
    expect(toast.error).toHaveBeenCalledWith('Invalid payload submitted')
  })

  it('handles network throw by wrapping in ApiError and showing toast', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'))

    await expect(apiGet('/api/students')).rejects.toThrow('Failed to fetch')
    expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.')
  })

  it('performs PUT and DELETE requests correctly', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as any)

    const putRes = await apiPut('/api/students/1', { name: 'Updated' })
    const delRes = await apiDelete('/api/students/1')

    expect(putRes).toEqual({ success: true })
    expect(delRes).toEqual({ success: true })
  })
})
