'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentFormState } from '../types'

interface BasicInfoSectionProps {
  formData: StudentFormState
  onChange: (field: keyof StudentFormState, value: any) => void
}

export function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="student-name">Full Name *</Label>
        <Input
          id="student-name"
          placeholder="e.g. Rahul Sharma"
          value={formData.name}
          onChange={e => onChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-email">Email Address</Label>
        <Input
          id="student-email"
          type="email"
          placeholder="student@school.com"
          value={formData.email}
          onChange={e => onChange('email', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-age">Age *</Label>
        <Input
          id="student-age"
          type="number"
          placeholder="10"
          value={formData.age}
          onChange={e => onChange('age', e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-grade">Grade / Class *</Label>
        <Select value={formData.grade} onValueChange={val => onChange('grade', val)}>
          <SelectTrigger id="student-grade">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Grade 1">Grade 1</SelectItem>
            <SelectItem value="Grade 2">Grade 2</SelectItem>
            <SelectItem value="Grade 3">Grade 3</SelectItem>
            <SelectItem value="Grade 4">Grade 4</SelectItem>
            <SelectItem value="Grade 5">Grade 5</SelectItem>
            <SelectItem value="Grade 6">Grade 6</SelectItem>
            <SelectItem value="Grade 7">Grade 7</SelectItem>
            <SelectItem value="Grade 8">Grade 8</SelectItem>
            <SelectItem value="Grade 9">Grade 9</SelectItem>
            <SelectItem value="Grade 10">Grade 10</SelectItem>
            <SelectItem value="Grade 11">Grade 11</SelectItem>
            <SelectItem value="Grade 12">Grade 12</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="student-roll">Roll Number</Label>
        <Input
          id="student-roll"
          placeholder="e.g. 101"
          value={formData.rollNumber}
          onChange={e => onChange('rollNumber', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-contact">Primary Parent Contact *</Label>
        <Input
          id="parent-contact"
          placeholder="+91 9876543210"
          value={formData.parentContact}
          onChange={e => onChange('parentContact', e.target.value)}
        />
      </div>
    </div>
  )
}
