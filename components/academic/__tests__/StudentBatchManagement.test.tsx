import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import StudentBatchManagement from '../StudentBatchManagement'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    batches: [],
  }),
} as any)

describe('StudentBatchManagement Component', () => {
  it('renders title and add batch button', () => {
    render(<StudentBatchManagement />)

    expect(screen.getByText('Student Batch Management')).toBeInTheDocument()
    expect(screen.getByText('Add Batch')).toBeInTheDocument()
  })
})
