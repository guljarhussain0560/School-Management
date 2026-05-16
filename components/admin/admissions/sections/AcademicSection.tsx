'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StudentFormState } from '../types'

interface AcademicSectionProps {
  formData: StudentFormState
  onChange: (field: keyof StudentFormState, value: any) => void
}

export function AcademicSection({ formData, onChange }: AcademicSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="prev-school">Previous School Attended</Label>
        <Input
          id="prev-school"
          placeholder="St. Xavier High School"
          value={formData.previousSchool}
          onChange={e => onChange('previousSchool', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prev-grade">Previous Grade / Standard</Label>
        <Input
          id="prev-grade"
          placeholder="Grade 9"
          value={formData.previousGrade}
          onChange={e => onChange('previousGrade', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adm-no">Admission Number</Label>
        <Input
          id="adm-no"
          placeholder="ADM-2026-001"
          value={formData.admissionNumber}
          onChange={e => onChange('admissionNumber', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acad-year">Academic Year</Label>
        <Input
          id="acad-year"
          placeholder="2026-2027"
          value={formData.academicYear}
          onChange={e => onChange('academicYear', e.target.value)}
        />
      </div>
    </div>
  )
}
