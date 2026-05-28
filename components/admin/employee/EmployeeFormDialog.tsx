'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeFormData, Employee } from './types'

interface EmployeeFormDialogProps {
  isOpen: boolean
  isEditing: boolean
  formData: EmployeeFormData
  isSubmitting: boolean
  onChange: (field: keyof EmployeeFormData, value: any) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function EmployeeFormDialog({
  isOpen,
  isEditing,
  formData,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: EmployeeFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Employee Profile' : 'Register New Faculty / Staff Member'}</DialogTitle>
          <DialogDescription>
            Enter personal credentials, department assignment, and payroll compensation details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emp-name">Full Name *</Label>
              <Input
                id="emp-name"
                placeholder="Dr. John Doe"
                value={formData.name}
                onChange={e => onChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-email">Email Address *</Label>
              <Input
                id="emp-email"
                type="email"
                placeholder="john.doe@school.edu"
                value={formData.email}
                onChange={e => onChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-phone">Phone Number</Label>
              <Input
                id="emp-phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={e => onChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-dept">Department *</Label>
              <Select value={formData.department} onValueChange={val => onChange('department', val)}>
                <SelectTrigger id="emp-dept">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teaching">Teaching / Academic</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-pos">Position / Role *</Label>
              <Input
                id="emp-pos"
                placeholder="Senior Mathematics Teacher"
                value={formData.position}
                onChange={e => onChange('position', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-salary">Monthly Salary (₹) *</Label>
              <Input
                id="emp-salary"
                type="number"
                placeholder="45000"
                value={formData.salary}
                onChange={e => onChange('salary', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-status">Employment Status</Label>
              <Select value={formData.status} onValueChange={val => onChange('status', val as any)}>
                <SelectTrigger id="emp-status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-joining">Date of Joining</Label>
              <Input
                id="emp-joining"
                type="date"
                value={formData.dateOfJoining}
                onChange={e => onChange('dateOfJoining', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Profile...' : isEditing ? 'Update Employee' : 'Register Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
