'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export interface StudentPerformanceRecord {
  id: string
  studentId: string
  studentName: string
  subject: string
  grade: string
  marks: number
  maxMarks: number
  examType: string
  examDate?: string
  remarks?: string
}

export function usePerformanceState() {
  const [performanceForm, setPerformanceForm] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    grade: '',
    marks: '',
    maxMarks: '100',
    examType: '',
    examDate: new Date().toISOString().split('T')[0],
    remarks: '',
  })

  const [performances, setPerformances] = useState<StudentPerformanceRecord[]>([])
  const [isLoadingPerformances, setIsLoadingPerformances] = useState(false)
  const [performanceSearch, setPerformanceSearch] = useState('')
  const [performanceGradeFilter, setPerformanceGradeFilter] = useState('all')

  const handleFormChange = (field: string, value: string) => {
    setPerformanceForm(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setPerformanceForm({
      studentId: '',
      studentName: '',
      subject: '',
      grade: '',
      marks: '',
      maxMarks: '100',
      examType: '',
      examDate: new Date().toISOString().split('T')[0],
      remarks: '',
    })
  }

  const handleSubmitPerformance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!performanceForm.studentId || !performanceForm.subject || !performanceForm.marks) {
      toast.error('Please enter student ID, subject, and marks')
      return
    }

    try {
      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: performanceForm.studentId,
          subject: performanceForm.subject,
          grade: performanceForm.grade,
          marks: parseFloat(performanceForm.marks),
          maxMarks: parseFloat(performanceForm.maxMarks),
          examType: performanceForm.examType || 'Term Exam',
          examDate: performanceForm.examDate,
          remarks: performanceForm.remarks,
        }),
      })

      if (response.ok) {
        toast.success('Performance marks recorded successfully')
        resetForm()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit marks')
      }
    } catch {
      toast.error('Network error saving performance record')
    }
  }

  return {
    performanceForm,
    handleFormChange,
    resetForm,
    handleSubmitPerformance,
    performances,
    setPerformances,
    isLoadingPerformances,
    performanceSearch,
    setPerformanceSearch,
    performanceGradeFilter,
    setPerformanceGradeFilter,
  }
}
