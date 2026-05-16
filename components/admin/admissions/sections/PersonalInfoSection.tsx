'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentFormState } from '../types'

interface PersonalInfoSectionProps {
  formData: StudentFormState
  onChange: (field: keyof StudentFormState, value: any) => void
}

export function PersonalInfoSection({ formData, onChange }: PersonalInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="student-dob">Date of Birth</Label>
        <Input
          id="student-dob"
          type="date"
          value={formData.dateOfBirth}
          onChange={e => onChange('dateOfBirth', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-gender">Gender</Label>
        <Select value={formData.gender} onValueChange={val => onChange('gender', val)}>
          <SelectTrigger id="student-gender">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-blood">Blood Group</Label>
        <Select value={formData.bloodGroup} onValueChange={val => onChange('bloodGroup', val)}>
          <SelectTrigger id="student-blood">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-nationality">Nationality</Label>
        <Input
          id="student-nationality"
          placeholder="Indian"
          value={formData.nationality}
          onChange={e => onChange('nationality', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-religion">Religion</Label>
        <Input
          id="student-religion"
          placeholder="e.g. Hinduism / Islam / Christianity"
          value={formData.religion}
          onChange={e => onChange('religion', e.target.value)}
        />
      </div>
    </div>
  )
}
