'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { downloadReceiptPDF } from '@/lib/pdf-receipt'

export interface FeeRecord {
  id: string
  studentId: string
  studentName?: string
  grade?: string
  amount: number
  paymentMode: string
  date: string
  notes?: string
  status?: string
}

export function useFeeCollection() {
  const [feeCurrentPage, setFeeCurrentPage] = useState(1)
  const [feeTotalPages, setFeeTotalPages] = useState(1)
  const [feeSearchTerm, setFeeSearchTerm] = useState('')
  const [feeSearchField, setFeeSearchField] = useState('studentId')
  const [feePaymentModeFilter, setFeePaymentModeFilter] = useState('all')
  const [isLoadingFeeCollections, setIsLoadingFeeCollections] = useState(false)
  const [recentFeeCollections, setRecentFeeCollections] = useState<FeeRecord[]>([])
  const [printDateRange, setPrintDateRange] = useState({ from: '', to: '' })

  const [feeForm, setFeeForm] = useState({
    studentId: '',
    amount: '',
    paymentMode: '',
    notes: '',
  })

  const handleFeeFormChange = (field: string, value: string) => {
    setFeeForm(prev => ({ ...prev, [field]: value }))
  }

  const resetFeeForm = () => {
    setFeeForm({
      studentId: '',
      amount: '',
      paymentMode: '',
      notes: '',
    })
  }

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feeForm.studentId || !feeForm.amount || !feeForm.paymentMode) {
      toast.error('Please fill all required fee collection fields')
      return
    }

    try {
      const response = await fetch('/api/financial/fee-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeForm),
      })

      if (response.ok) {
        toast.success('Fee collected successfully')
        resetFeeForm()
      } else {
        const err = await response.json()
        toast.error(err.error || 'Failed to collect fee')
      }
    } catch {
      toast.error('Network error while processing fee')
    }
  }

  const handleDownloadReceipt = (record: FeeRecord) => {
    try {
      downloadReceiptPDF({
        receiptNumber: `REC-${record.id.slice(-6).toUpperCase()}`,
        studentId: record.studentId,
        studentName: record.studentName || 'Student',
        grade: record.grade || 'Standard',
        amount: Number(record.amount),
        paymentMode: record.paymentMode,
        date: record.date || new Date().toISOString().split('T')[0],
        collectedBy: 'School Administrator',
        schoolName: 'Greenwood High School',
      })
      toast.success('Receipt downloaded successfully')
    } catch {
      toast.error('Error generating PDF receipt')
    }
  }

  return {
    feeCurrentPage,
    setFeeCurrentPage,
    feeTotalPages,
    setFeeTotalPages,
    feeSearchTerm,
    setFeeSearchTerm,
    feeSearchField,
    setFeeSearchField,
    feePaymentModeFilter,
    setFeePaymentModeFilter,
    isLoadingFeeCollections,
    recentFeeCollections,
    setRecentFeeCollections,
    printDateRange,
    setPrintDateRange,
    feeForm,
    handleFeeFormChange,
    resetFeeForm,
    handleFeeSubmit,
    handleDownloadReceipt,
  }
}
