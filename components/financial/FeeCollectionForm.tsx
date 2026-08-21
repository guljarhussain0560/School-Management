'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentOption, FeeStructureOption } from './hooks/useFeeCollections'

interface FeeCollectionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: {
    studentId: string
    feeStructureId?: string
    amount: number
    paymentMode: string
    notes?: string
  }) => Promise<unknown>
  students: StudentOption[]
  feeStructures: FeeStructureOption[]
}

export const FeeCollectionForm: React.FC<FeeCollectionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  feeStructures,
}) => {
  const [studentId, setStudentId] = useState('')
  const [feeStructureId, setFeeStructureId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('CASH')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleStructureSelect = (structId: string) => {
    setFeeStructureId(structId)
    const struct = feeStructures.find((s) => s.id === structId)
    if (struct && !amount) {
      setAmount(String(struct.amount))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit({
        studentId,
        feeStructureId: feeStructureId || undefined,
        amount: parseFloat(amount),
        paymentMode,
        notes: notes || undefined,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Collect Student Fee</DialogTitle>
          <DialogDescription>Record a tuition or departmental fee collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-select">Select Student *</Label>
            <Select value={studentId} onValueChange={setStudentId} required>
              <SelectTrigger id="student-select">
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee-struct-select">Fee Structure (Optional)</Label>
            <Select value={feeStructureId} onValueChange={handleStructureSelect}>
              <SelectTrigger id="fee-struct-select">
                <SelectValue placeholder="Select fee category/structure" />
              </SelectTrigger>
              <SelectContent>
                {feeStructures.map((struct) => (
                  <SelectItem key={struct.id} value={struct.id}>
                    {struct.name} - ${struct.amount} ({struct.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee-amount">Amount ($) *</Label>
              <Input
                id="fee-amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-mode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger id="payment-mode">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI / Digital</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee-notes">Payment Notes</Label>
            <Textarea
              id="fee-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q1 Tuition Fee paid in full"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
