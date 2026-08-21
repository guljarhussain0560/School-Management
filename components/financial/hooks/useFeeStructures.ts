import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface FeeStructure {
  id: string
  feeCode: string
  name: string
  description?: string
  amount: number
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  applicableTo?: string
  class?: {
    id: string
    className: string
    classCode: string
  }
  batch?: {
    id: string
    batchName: string
    batchCode: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    collections: number
  }
  createdAt: string
  updatedAt: string
}

export interface ClassItem {
  id: string
  className: string
  classCode: string
}

export interface BatchItem {
  id: string
  batchName: string
  batchCode: string
}

export interface FeeStructureFormData {
  name: string
  description: string
  amount: string
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  applicableTo: string
  classId: string
  batchId: string
}

export const initialFormData: FeeStructureFormData = {
  name: '',
  description: '',
  amount: '',
  frequency: 'MONTHLY',
  category: 'TUITION',
  isMandatory: true,
  isActive: true,
  applicableFrom: new Date().toISOString().split('T')[0],
  applicableTo: '',
  classId: 'all',
  batchId: 'all',
}

export function useFeeStructures() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [batches, setBatches] = useState<BatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const [formData, setFormData] = useState<FeeStructureFormData>(initialFormData)

  const fetchFeeStructures = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial/fee-structures')
      if (response.ok) {
        const data = await response.json()
        setFeeStructures(data.feeStructures || [])
      } else {
        toast.error('Failed to fetch fee structures')
      }
    } catch (error) {
      logger.error('Error fetching fee structures', error as Error, { context: 'useFeeStructures' })
      toast.error('Error fetching fee structures')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/academic/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      logger.error('Error fetching classes', error as Error, { context: 'useFeeStructures' })
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/academic/student-batches')
      if (response.ok) {
        const data = await response.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      logger.error('Error fetching batches', error as Error, { context: 'useFeeStructures' })
    }
  }

  useEffect(() => {
    fetchFeeStructures()
    fetchClasses()
    fetchBatches()
  }, [])

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingFee(null)
  }

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        classId: formData.classId === 'all' ? null : formData.classId,
        batchId: formData.batchId === 'all' ? null : formData.batchId,
      }

      const response = await fetch('/api/financial/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success('Fee structure created successfully')
        resetForm()
        setIsCreateDialogOpen(false)
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create fee structure')
      }
    } catch (error) {
      logger.error('Error creating fee structure', error as Error)
      toast.error('Error creating fee structure')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFee) return

    setLoading(true)

    try {
      const payload = {
        id: editingFee.id,
        ...formData,
        classId: formData.classId === 'all' ? null : formData.classId,
        batchId: formData.batchId === 'all' ? null : formData.batchId,
      }

      const response = await fetch('/api/financial/fee-structures', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success('Fee structure updated successfully')
        resetForm()
        setEditingFee(null)
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update fee structure')
      }
    } catch (error) {
      logger.error('Error updating fee structure', error as Error)
      toast.error('Error updating fee structure')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeeStructure = async (feeStructureId: string) => {
    try {
      const response = await fetch(`/api/financial/fee-structures?id=${feeStructureId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Fee structure deleted successfully')
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete fee structure')
      }
    } catch (error) {
      logger.error('Error deleting fee structure', error as Error)
      toast.error('Error deleting fee structure')
    }
  }

  const openEditDialog = (fee: FeeStructure) => {
    setEditingFee(fee)
    setFormData({
      name: fee.name,
      description: fee.description || '',
      amount: fee.amount.toString(),
      frequency: fee.frequency,
      category: fee.category,
      isMandatory: fee.isMandatory,
      isActive: fee.isActive,
      applicableFrom: fee.applicableFrom ? fee.applicableFrom.split('T')[0] : '',
      applicableTo: fee.applicableTo ? fee.applicableTo.split('T')[0] : '',
      classId: fee.class?.id || 'all',
      batchId: fee.batch?.id || 'all',
    })
  }

  const filteredFeeStructures = feeStructures.filter((fee) => {
    const matchesSearch =
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fee.description && fee.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || fee.category === categoryFilter
    const matchesClass = classFilter === 'all' || fee.class?.id === classFilter

    return matchesSearch && matchesCategory && matchesClass
  })

  return {
    feeStructures: filteredFeeStructures,
    classes,
    batches,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingFee,
    setEditingFee,
    formData,
    setFormData,
    resetForm,
    handleCreateFeeStructure,
    handleUpdateFeeStructure,
    handleDeleteFeeStructure,
    openEditDialog,
  }
}
