'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

export interface Student {
  id: string
  studentId: string
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  parentName?: string
  parentPhone?: string
  status: string
  class?: {
    id: string
    className?: string
    classCode?: string
    sectionName?: string
  }
  batch?: {
    id: string
    batchName: string
    academicYear: string
  }
}

export interface ClassOption {
  id: string
  className?: string
  classCode?: string
}

export interface BatchOption {
  id: string
  batchName: string
  academicYear: string
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [batches, setBatches] = useState<BatchOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ students: Student[] }>('/api/students', {
        context: 'useStudents.fetchStudents',
      })
      setStudents(data?.students || [])
    } catch {
      // Handled
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDependencies = useCallback(async () => {
    try {
      const [classesData, batchesData] = await Promise.all([
        apiGet<{ classes: ClassOption[] }>('/api/academic/classes', { showErrorToast: false }),
        apiGet<{ batches: BatchOption[] }>('/api/academic/student-batches', { showErrorToast: false }),
      ])
      setClasses(classesData?.classes || [])
      setBatches(batchesData?.batches || [])
    } catch {
      // Handled
    }
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchDependencies()
  }, [fetchStudents, fetchDependencies])

  const createStudent = async (studentData: Partial<Student>) => {
    const result = await apiPost('/api/students', studentData, {
      showSuccessToast: true,
      successMessage: 'Student enrolled successfully',
      context: 'useStudents.createStudent',
    })
    if (result) {
      await fetchStudents()
      setShowCreateDialog(false)
    }
    return result
  }

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    const result = await apiPut(`/api/students/${id}`, studentData, {
      showSuccessToast: true,
      successMessage: 'Student record updated',
      context: 'useStudents.updateStudent',
    })
    if (result) {
      await fetchStudents()
      setShowEditDialog(false)
    }
    return result
  }

  const deleteStudent = async (id: string) => {
    await apiDelete(`/api/students/${id}`, {
      showSuccessToast: true,
      successMessage: 'Student record removed',
      context: 'useStudents.deleteStudent',
    })
    await fetchStudents()
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return {
    students: filteredStudents,
    rawStudents: students,
    classes,
    batches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    selectedStudent,
    setSelectedStudent,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  }
}
