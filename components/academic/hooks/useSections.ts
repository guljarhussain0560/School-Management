import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface Grade {
  id: string
  gradeCode: string
  gradeName: string
  gradeLevel: number
  description?: string
  isActive: boolean
  batch?: {
    id: string
    batchName: string
    academicYear: string
  }
  sections?: Section[]
  _count?: {
    sections: number
    subjects: number
  }
}

export interface Section {
  id: string
  classCode: string
  sectionName: string
  sectionType: 'LETTER' | 'COLOR' | 'NUMBER'
  description?: string
  capacity: number
  isActive: boolean
  grade?: {
    id: string
    gradeName: string
    gradeCode: string
  }
  classTeacher?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    students: number
    subjects: number
  }
}

export interface SectionFormData {
  gradeId: string
  sectionName: string
  sectionType: 'LETTER' | 'COLOR' | 'NUMBER'
  description: string
  capacity: number
  classTeacherId: string
}

export const initialSectionFormData: SectionFormData = {
  gradeId: '',
  sectionName: '',
  sectionType: 'LETTER',
  description: '',
  capacity: 40,
  classTeacherId: '',
}

export function useSections() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState<SectionFormData>(initialSectionFormData)

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/academic/grades')
      if (response.ok) {
        const data = await response.json()
        setGrades(data.grades || [])
      }
    } catch (error) {
      logger.error('Error fetching grades', error as Error, { context: 'useSections' })
    }
  }

  const fetchSections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/academic/classes')
      if (response.ok) {
        const data = await response.json()
        setSections(data.classes || [])
      }
    } catch (error) {
      logger.error('Error fetching sections', error as Error, { context: 'useSections' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrades()
    fetchSections()
  }, [])

  const resetForm = () => {
    setFormData(initialSectionFormData)
    setEditingSection(null)
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Section created successfully')
        resetForm()
        setIsCreateOpen(false)
        fetchSections()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create section')
      }
    } catch (error) {
      logger.error('Error creating section', error as Error)
      toast.error('Error creating section')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection) return
    setLoading(true)

    try {
      const response = await fetch(`/api/academic/classes?id=${editingSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Section updated successfully')
        resetForm()
        setEditingSection(null)
        fetchSections()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update section')
      }
    } catch (error) {
      logger.error('Error updating section', error as Error)
      toast.error('Error updating section')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/academic/classes?id=${sectionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Section deleted successfully')
        fetchSections()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete section')
      }
    } catch (error) {
      logger.error('Error deleting section', error as Error)
      toast.error('Error deleting section')
    }
  }

  const openEditDialog = (section: Section) => {
    setEditingSection(section)
    setFormData({
      gradeId: section.grade?.id || '',
      sectionName: section.sectionName,
      sectionType: section.sectionType,
      description: section.description || '',
      capacity: section.capacity,
      classTeacherId: section.classTeacher?.id || '',
    })
  }

  const filteredSections = sections.filter(sec => {
    const matchesSearch =
      sec.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.classCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = selectedGrade === 'all' || sec.grade?.id === selectedGrade
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? sec.isActive : !sec.isActive)

    return matchesSearch && matchesGrade && matchesStatus
  })

  return {
    grades,
    sections: filteredSections,
    loading,
    searchTerm,
    setSearchTerm,
    selectedGrade,
    setSelectedGrade,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingSection,
    formData,
    setFormData,
    resetForm,
    handleCreateSection,
    handleUpdateSection,
    handleDeleteSection,
    openEditDialog,
  }
}
