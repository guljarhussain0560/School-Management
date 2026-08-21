import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SchoolManagement from '../SchoolManagement'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    profile: {
      schoolName: 'Test School',
      schoolCode: 'TST001',
    },
    settings: {},
  }),
} as any)

describe('SchoolManagement Component', () => {
  it('renders title and tabs', () => {
    render(<SchoolManagement />)

    expect(screen.getByText('Institutional Management')).toBeInTheDocument()
    expect(screen.getByText('School Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings & Schedule')).toBeInTheDocument()
  })
})
