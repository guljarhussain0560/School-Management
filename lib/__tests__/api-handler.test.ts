import { describe, it, expect } from 'vitest'
import { apiSuccess, apiError, handleApiError } from '../api-handler'
import { z, ZodError } from 'zod'

describe('API Handler & Response Utilities', () => {
  it('formats apiSuccess correctly with 200 default status', async () => {
    const res = apiSuccess({ id: '123', name: 'Test' }, 'Created successfully', 201)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Created successfully')
    expect(data.data.name).toBe('Test')
  })

  it('formats apiError with correct status and payload', async () => {
    const res = apiError('Resource not found', 404, { id: '999' })
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Resource not found')
    expect(data.details.id).toBe('999')
  })

  it('handles ZodError properly in handleApiError', async () => {
    const schema = z.object({ age: z.number().min(18) })
    try {
      schema.parse({ age: 12 })
    } catch (err) {
      const res = handleApiError(err)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeInstanceOf(Array)
    }
  })
})
