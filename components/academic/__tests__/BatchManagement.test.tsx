import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import BatchManagement from '../BatchManagement'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    batches: [],
  }),
} as any)

describe('BatchManagement Component', () => {
  it('renders stats, header, and create batch button', () => {
    render(<BatchManagement />)

    expect(screen.getByText('Batch & Cohort Management')).toBeInTheDocument()
    expect(screen.getByText('Create New Batch')).toBeInTheDocument()
    expect(screen.getByText('Total Batches')).toBeInTheDocument()
    expect(screen.getByText('Enrolled Students')).toBeInTheDocument()
  })
})
