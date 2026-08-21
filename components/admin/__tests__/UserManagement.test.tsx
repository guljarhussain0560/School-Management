import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import UserManagement from '../UserManagement'
import { logger } from '@/lib/logger'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('UserManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user list and header correctly', async () => {
    const mockUsers = [
      {
        id: 'u-1',
        name: 'Sarah Connor',
        email: 'sarah@school.edu',
        role: 'TEACHER',
        isActive: true,
        createdAt: '2026-01-01',
      },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockUsers }),
    } as any)

    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeDefined()
      expect(screen.getByText('Sarah Connor')).toBeDefined()
    })
  })

  it('invokes logger.error when fetch rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(<UserManagement />)

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Exception fetching users:'),
        expect.anything()
      )
    })
  })
})
