'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getExams, getSubjects, getClasses, createExam, deleteExam } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

export interface Exam {
  id: string
  examName: string
  examType: string
  subject: {
    id: string
    subjectName: string
  }
  class: {
    id: string
    className: string
  }
  totalMarks: number
  passingMarks: number
  duration: number
  instructions?: string
  isActive: boolean
  createdAt: string
  schedules?: ExamSchedule[]
  results?: ExamResult[]
}

export interface ExamSchedule {
  id: string
  examDate: string
  startTime: string
  endTime: string
  venue?: string
  supervisor?: string
  isActive: boolean
}

export interface ExamResult {
  id: string
  student: {
    id: string
    name: string
    rollNumber: string
  }
  marksObtained: number
  grade?: string
  remarks?: string
  isPassed: boolean
}

export interface Subject {
  id: string
  subjectName: string
}

export interface ClassItem {
  id: string
  className: string
}

export function useExamManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterClass, setFilterClass] = useState('all')

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getExams()
      setExams(data.exams || [])
    } catch (error) {
      logger.error('Error fetching exams', error as Error, { context: 'useExamManagement' })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await getSubjects()
      setSubjects(data.subjects || [])
    } catch (error) {
      logger.error('Error fetching subjects', error as Error, { context: 'useExamManagement' })
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClasses()
      setClasses(data.classes || [])
    } catch (error) {
      logger.error('Error fetching classes', error as Error, { context: 'useExamManagement' })
    }
  }, [])

  const handleCreateExam = async (payload: unknown) => {
    try {
      await createExam(payload)
      await fetchExams()
      return true
    } catch (error) {
      logger.error('Error creating exam', error as Error, { context: 'useExamManagement' })
      return false
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return false
    try {
      await deleteExam(examId)
      setExams((prev) => prev.filter((e) => e.id !== examId))
      return true
    } catch (error) {
      logger.error('Error deleting exam', error as Error, { context: 'useExamManagement' })
      return false
    }
  }

  useEffect(() => {
    fetchExams()
    fetchSubjects()
    fetchClasses()
  }, [fetchExams, fetchSubjects, fetchClasses])

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject?.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.class?.className.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || exam.examType === filterType
      const matchesClass = filterClass === 'all' || exam.class?.id === filterClass

      return matchesSearch && matchesType && matchesClass
    })
  }, [exams, searchTerm, filterType, filterClass])

  return {
    exams,
    filteredExams,
    subjects,
    classes,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterClass,
    setFilterClass,
    fetchExams,
    handleCreateExam,
    handleDeleteExam,
  }
}
