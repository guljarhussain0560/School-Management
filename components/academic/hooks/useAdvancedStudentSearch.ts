'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export interface StudentSearchResult {
  id: string
  studentId: string
  name: string
  email?: string
  age: number
  rollNumber: string
  parentContact?: string
  status: string
  admissionDate?: string
  class: {
    id: string
    sectionName: string
    sectionType: string
    classCode: string
    grade?: {
      id: string
      gradeName: string
      gradeCode: string
      gradeLevel: number
    }
    batch?: {
      id: string
      batchName: string
      academicYear: string
    }
  }
}

export interface StudentBatch {
  id: string
  batchName: string
  academicYear: string
}

export interface Grade {
  id: string
  gradeName: string
}

export interface Section {
  id: string
  sectionName: string
}

export function useAdvancedStudentSearch() {
  const [students, setStudents] = useState<StudentSearchResult[]>([])
  const [batches, setBatches] = useState<StudentBatch[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    batchId: 'all',
    gradeId: 'all',
    sectionId: 'all',
    status: 'all',
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  const fetchDropdownOptions = useCallback(async () => {
    try {
      const [batchesRes, gradesRes, sectionsRes] = await Promise.all([
        apiGet<any>('/api/academic/batches', { showErrorToast: false }).catch(() => ({ batches: [] })),
        apiGet<any>('/api/academic/grades', { showErrorToast: false }).catch(() => ({ grades: [] })),
        apiGet<any>('/api/academic/sections', { showErrorToast: false }).catch(() => ({ sections: [] })),
      ])

      setBatches(batchesRes.batches || [])
      setGrades(gradesRes.grades || [])
      setSections(sectionsRes.sections || [])
    } catch (error) {
      logger.error('Error fetching search dropdown options', error as Error, { context: 'useAdvancedStudentSearch' })
    }
  }, [])

  const executeSearch = useCallback(
    async (pageToFetch = 1) => {
      try {
        setIsLoading(true)
        const params: Record<string, string> = {
          page: String(pageToFetch),
          limit: String(pagination.limit),
        }

        if (searchFilters.searchTerm) params.search = searchFilters.searchTerm
        if (searchFilters.batchId !== 'all') params.batchId = searchFilters.batchId
        if (searchFilters.gradeId !== 'all') params.gradeId = searchFilters.gradeId
        if (searchFilters.sectionId !== 'all') params.sectionId = searchFilters.sectionId
        if (searchFilters.status !== 'all') params.status = searchFilters.status

        const query = new URLSearchParams(params).toString()
        const data = await apiGet<any>(`/api/academic/students?${query}`, {
          context: 'useAdvancedStudentSearch',
        })

        if (data?.students) {
          setStudents(data.students)
          if (data.pagination) {
            setPagination((prev) => ({
              ...prev,
              page: data.pagination.page,
              total: data.pagination.total,
              pages: data.pagination.pages,
            }))
          }
        }
        setHasSearched(true)
      } catch (error) {
        logger.error('Error searching students', error as Error, { context: 'useAdvancedStudentSearch' })
      } finally {
        setIsLoading(false)
      }
    },
    [searchFilters, pagination.limit]
  )

  const exportToExcel = () => {
    if (students.length === 0) {
      toast.error('No student data to export')
      return
    }

    const exportRows = students.map((s) => ({
      'Student ID': s.studentId,
      'Full Name': s.name,
      'Roll Number': s.rollNumber,
      'Email': s.email || 'N/A',
      'Batch': s.class?.batch?.batchName || 'N/A',
      'Grade': s.class?.grade?.gradeName || 'N/A',
      'Section': s.class?.sectionName || 'N/A',
      'Status': s.status,
      'Parent Contact': s.parentContact || 'N/A',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    XLSX.writeFile(workbook, `student_search_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Student list exported to Excel')
  }

  const resetFilters = () => {
    setSearchFilters({
      searchTerm: '',
      batchId: 'all',
      gradeId: 'all',
      sectionId: 'all',
      status: 'all',
    })
  }

  useEffect(() => {
    fetchDropdownOptions()
    executeSearch(1)
  }, [fetchDropdownOptions, executeSearch])

  return {
    students,
    batches,
    grades,
    sections,
    isLoading,
    hasSearched,
    searchFilters,
    setSearchFilters,
    pagination,
    setPagination,
    executeSearch,
    exportToExcel,
    resetFilters,
  }
}
