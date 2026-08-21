import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import AcademicView from '../AcademicView'

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', role: 'ADMIN' } }, status: 'authenticated' }),
}))

vi.mock('@/components/admin/TeacherAssignments', () => ({
  default: () => <div data-testid="teacher-assignments">Teacher Assignments Mock</div>,
}))

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ students: [], assignments: [], progress: [] }),
} as any)

describe('AcademicView Component', () => {
  it('renders tab triggers and header', () => {
    render(<AcademicView />)

    expect(screen.getByText('Academic Management')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Assignments')).toBeInTheDocument()
    expect(screen.getByText('Curriculum')).toBeInTheDocument()
  })
})
