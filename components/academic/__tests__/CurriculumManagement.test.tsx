import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import CurriculumManagement from '../CurriculumManagement'

const mockCurriculum = [
  { id: 'c1', subject: 'Mathematics', grade: 'Grade 10', module: 'Trigonometry & Calculus', progress: 75 },
  { id: 'c2', subject: 'Physics', grade: 'Grade 10', module: 'Thermodynamics', progress: 100 },
]

describe('CurriculumManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ curriculum: mockCurriculum }),
    })
  })

  it('renders curriculum header and modules table', () => {
    render(<CurriculumManagement />)
    expect(screen.getByText('Curriculum & Syllabus Management')).toBeInTheDocument()
    expect(screen.getByText('Total Modules')).toBeInTheDocument()
    expect(screen.getByText('Curriculum Modules & Lesson Plans')).toBeInTheDocument()
  })
})
