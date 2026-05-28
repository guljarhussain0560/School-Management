'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Building, Calendar, DollarSign, Briefcase } from 'lucide-react'
import { Employee } from './types'

interface EmployeeDetailsModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
}

export function EmployeeDetailsModal({ employee, isOpen, onClose }: EmployeeDetailsModalProps) {
  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {employee.name}
            </DialogTitle>
            <Badge variant="outline">{employee.status}</Badge>
          </div>
          <DialogDescription>
            Employee ID: {employee.employeeId} • {employee.position}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4 border-y text-sm">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{employee.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{employee.department}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Monthly Salary</p>
              <p className="font-medium">₹{Number(employee.salary).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Joining Date</p>
              <p className="font-medium">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{employee.position}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
