'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StudentFormState } from '../types'

interface ContactSectionProps {
  formData: StudentFormState
  onChange: (field: keyof StudentFormState, value: any) => void
}

export function ContactSection({ formData, onChange }: ContactSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="parent-name">Guardian / Parent Name *</Label>
        <Input
          id="parent-name"
          placeholder="Father's / Mother's Name"
          value={formData.parentName}
          onChange={e => onChange('parentName', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-phone">Parent Mobile Phone *</Label>
        <Input
          id="parent-phone"
          placeholder="+91 9876543210"
          value={formData.parentPhone}
          onChange={e => onChange('parentPhone', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-email">Parent Email</Label>
        <Input
          id="parent-email"
          type="email"
          placeholder="parent@example.com"
          value={formData.parentEmail}
          onChange={e => onChange('parentEmail', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parent-occ">Parent Occupation</Label>
        <Input
          id="parent-occ"
          placeholder="e.g. Engineer / Doctor / Business"
          value={formData.parentOccupation}
          onChange={e => onChange('parentOccupation', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="perm-address">Residential Address</Label>
        <Input
          id="perm-address"
          placeholder="123 Park Avenue, City, State"
          value={formData.permanentAddress}
          onChange={e => onChange('permanentAddress', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="perm-city">City & Pincode</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="perm-city"
            placeholder="City"
            value={formData.city}
            onChange={e => onChange('city', e.target.value)}
          />
          <Input
            id="perm-pin"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={e => onChange('pincode', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
