'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StudentFormState } from '../types'

interface DocumentsSectionProps {
  formData: StudentFormState
  onChange: (field: keyof StudentFormState, value: any) => void
}

export function DocumentsSection({ formData, onChange }: DocumentsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5 p-3 border rounded-lg bg-muted/20">
        <Label htmlFor="doc-birth">Birth Certificate</Label>
        <Input
          id="doc-birth"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => onChange('birthCertificate', e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-1.5 p-3 border rounded-lg bg-muted/20">
        <Label htmlFor="doc-tc">Transfer Certificate (TC)</Label>
        <Input
          id="doc-tc"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => onChange('transferCertificate', e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-1.5 p-3 border rounded-lg bg-muted/20">
        <Label htmlFor="doc-marks">Previous Marksheet</Label>
        <Input
          id="doc-marks"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => onChange('markSheets', e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-1.5 p-3 border rounded-lg bg-muted/20">
        <Label htmlFor="doc-aadhar">Aadhar / National ID</Label>
        <Input
          id="doc-aadhar"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => onChange('aadharCard', e.target.files?.[0] || null)}
        />
      </div>
    </div>
  )
}
