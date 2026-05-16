'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Phone, MapPin, BookOpen, HeartPulse, Bus } from 'lucide-react'
import { StudentAdmissionData } from './types'

interface StudentAdmissionDialogProps {
  student: StudentAdmissionData | null
  isOpen: boolean
  onClose: () => void
}

export function StudentAdmissionDialog({ student, isOpen, onClose }: StudentAdmissionDialogProps) {
  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {student.name}
            </DialogTitle>
            <Badge variant="outline">{student.status || student.admissionStatus || 'Active'}</Badge>
          </div>
          <DialogDescription>
            Student ID: {student.studentId || 'N/A'} • Enrolled in {student.grade || 'Standard'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Academic Details</p>
                <p className="text-sm font-medium">Grade: {student.grade || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Roll No: {student.rollNumber || 'Not assigned'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Guardian Contact</p>
                <p className="text-sm font-medium">{student.parentName || 'Parent / Guardian'}</p>
                <p className="text-xs text-muted-foreground">{student.parentContact || student.parentPhone || student.email || 'No phone'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Address</p>
                <p className="text-sm">{student.address || student.permanentAddress || 'Not provided'}</p>
                {student.city && <p className="text-xs text-muted-foreground">{student.city}, {student.state} {student.pincode}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Bus className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Transport Route</p>
                <p className="text-sm">{student.busRouteId ? `Route Assigned (${student.busRouteId})` : 'Self Transport'}</p>
              </div>
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
