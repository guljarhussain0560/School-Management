'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

export interface FeeCollection {
  id: string
  feeId: string
  studentId: string
  feeStructureId?: string
  amount: number
  paymentMode: string
  collectedBy: string
  date: string
  dueDate?: string
  receiptUrl?: string
  notes?: string
  status?: string
  student?: {
    id: string
    name: string
    studentId: string
    class?: {
      className?: string
      classCode?: string
      sectionName?: string
    }
  }
  feeStructure?: {
    id: string
    name: string
    feeCode: string
    category: string
  }
}

export interface StudentOption {
  id: string
  name: string
  studentId: string
  class?: {
    className?: string
    classCode?: string
  }
}

export interface FeeStructureOption {
  id: string
  name: string
  feeCode: string
  category: string
  amount: number
}

export function useFeeCollections() {
  const [feeCollections, setFeeCollections] = useState<FeeCollection[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructureOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<FeeCollection | null>(null)

  const fetchFeeCollections = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ feeCollections: FeeCollection[] }>('/api/financial/fee-collections', {
        context: 'useFeeCollections.fetchFeeCollections',
      })
      setFeeCollections(data?.feeCollections || [])
    } catch {
      // Handled
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDependencies = useCallback(async () => {
    try {
      const [studentsData, feeStructuresData] = await Promise.all([
        apiGet<{ students: StudentOption[] }>('/api/students', { showErrorToast: false }),
        apiGet<{ feeStructures: FeeStructureOption[] }>('/api/financial/fee-structures', { showErrorToast: false }),
      ])
      setStudents(studentsData?.students || [])
      setFeeStructures(feeStructuresData?.feeStructures || [])
    } catch {
      // Handled
    }
  }, [])

  useEffect(() => {
    fetchFeeCollections()
    fetchDependencies()
  }, [fetchFeeCollections, fetchDependencies])

  const collectFee = async (payload: {
    studentId: string
    feeStructureId?: string
    amount: number
    paymentMode: string
    notes?: string
  }) => {
    const result = await apiPost('/api/financial/fee-collection', payload, {
      showSuccessToast: true,
      successMessage: 'Fee collection recorded successfully',
      context: 'useFeeCollections.collectFee',
    })
    if (result) {
      await fetchFeeCollections()
      setIsCreateDialogOpen(false)
    }
    return result
  }

  const updateCollection = async (id: string, payload: Partial<FeeCollection>) => {
    const result = await apiPut(`/api/financial/fee-collections/${id}`, payload, {
      showSuccessToast: true,
      successMessage: 'Fee record updated successfully',
      context: 'useFeeCollections.updateCollection',
    })
    if (result) {
      await fetchFeeCollections()
      setEditingCollection(null)
    }
    return result
  }

  const deleteCollection = async (id: string) => {
    await apiDelete(`/api/financial/fee-collections/${id}`, {
      showSuccessToast: true,
      successMessage: 'Fee record deleted successfully',
      context: 'useFeeCollections.deleteCollection',
    })
    await fetchFeeCollections()
  }

  const filteredCollections = feeCollections.filter((fc) => {
    const matchesSearch =
      fc.feeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fc.student?.name && fc.student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fc.student?.studentId && fc.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || fc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCollected = feeCollections.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  return {
    feeCollections: filteredCollections,
    rawCollections: feeCollections,
    students,
    feeStructures,
    loading,
    totalCollected,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingCollection,
    setEditingCollection,
    fetchFeeCollections,
    collectFee,
    updateCollection,
    deleteCollection,
  }
}
