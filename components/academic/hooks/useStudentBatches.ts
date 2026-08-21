import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface StudentBatch {
  id: string
  batchCode: string
  batchName: string
  academicYear: string
  startDate: string
  endDate?: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  createdAt: string
  creator?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    students: number
    classes: number
  }
}

export interface StudentBatchFormData {
  batchName: string
  academicYear: string
  startDate: string
  endDate: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export const initialBatchFormData: StudentBatchFormData = {
  batchName: '',
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  description: '',
  status: 'ACTIVE',
}

export function useStudentBatches() {
  const [batches, setBatches] = useState<StudentBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<StudentBatch | null>(null)
  const [formData, setFormData] = useState<StudentBatchFormData>(initialBatchFormData)

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/academic/student-batches')
      if (response.ok) {
        const data = await response.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      logger.error('Error fetching student batches', error as Error, { context: 'useStudentBatches' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const resetForm = () => {
    setFormData(initialBatchFormData)
    setEditingBatch(null)
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/student-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Batch created successfully')
        resetForm()
        setIsCreateOpen(false)
        fetchBatches()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create batch')
      }
    } catch (error) {
      logger.error('Error creating batch', error as Error)
      toast.error('Error creating batch')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch) return
    setLoading(true)

    try {
      const response = await fetch(`/api/academic/student-batches?id=${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Batch updated successfully')
        resetForm()
        setEditingBatch(null)
        fetchBatches()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update batch')
      }
    } catch (error) {
      logger.error('Error updating batch', error as Error)
      toast.error('Error updating batch')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const response = await fetch(`/api/academic/student-batches?id=${batchId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Batch deleted successfully')
        fetchBatches()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete batch')
      }
    } catch (error) {
      logger.error('Error deleting batch', error as Error)
      toast.error('Error deleting batch')
    }
  }

  const openEditDialog = (batch: StudentBatch) => {
    setEditingBatch(batch)
    setFormData({
      batchName: batch.batchName,
      academicYear: batch.academicYear,
      startDate: batch.startDate ? batch.startDate.split('T')[0] : '',
      endDate: batch.endDate ? batch.endDate.split('T')[0] : '',
      description: batch.description || '',
      status: batch.status,
    })
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch =
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.academicYear.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return {
    batches: filteredBatches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingBatch,
    formData,
    setFormData,
    resetForm,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    openEditDialog,
  }
}
