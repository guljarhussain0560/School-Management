import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import FeeStructureManagement from '../FeeStructureManagement'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    feeStructures: [],
    classes: [],
    batches: [],
  }),
} as any)

describe('FeeStructureManagement Component', () => {
  it('renders header, add button, and filters', () => {
    render(<FeeStructureManagement />)

    expect(screen.getByText('Fee Structure Management')).toBeInTheDocument()
    expect(screen.getByText('Add Fee Structure')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search fee code or name...')).toBeInTheDocument()
  })
})
