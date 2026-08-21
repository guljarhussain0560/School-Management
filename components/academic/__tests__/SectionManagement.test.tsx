import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SectionManagement from '../SectionManagement'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    grades: [],
    classes: [],
  }),
} as any)

describe('SectionManagement Component', () => {
  it('renders title and add section button', () => {
    render(<SectionManagement />)

    expect(screen.getByText('Section Management')).toBeInTheDocument()
    expect(screen.getByText('Add Section')).toBeInTheDocument()
  })
})
