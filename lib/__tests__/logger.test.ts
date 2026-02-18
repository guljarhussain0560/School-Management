import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '../logger'

describe('Structured Logger Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('logs info level messages with context', () => {
    logger.info('User logged in', { userId: 'usr-123', path: '/api/auth/login' })
    expect(console.log).toHaveBeenCalled()
  })

  it('logs warning level messages', () => {
    logger.warn('Rate limit approaching', { ip: '127.0.0.1' })
    expect(console.warn).toHaveBeenCalled()
  })

  it('logs error level messages with Error object and context', () => {
    const error = new Error('Database connection failed')
    logger.error('Failed query execution', error, { query: 'SELECT *' })
    expect(console.error).toHaveBeenCalled()
  })

  it('logs fatal level messages', () => {
    logger.fatal('Critical system failure', new Error('Out of memory'))
    expect(console.error).toHaveBeenCalled()
  })
})
