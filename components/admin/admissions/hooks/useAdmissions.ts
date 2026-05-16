'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { StudentFormState, StudentAdmissionData, AdmissionStats } from '../types'

export const initialStudentForm: StudentFormState = {
  name: '',
  email: '',
  age: '',
  grade: '',
  rollNumber: '',
  parentContact: '',
  address: '',
  idProofUrl: '',
  busRouteId: '',
  
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  nationality: '',
  religion: '',
  
  studentPhone: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentOccupation: '',
  emergencyContact: '',
  emergencyPhone: '',
  
  permanentAddress: '',
  temporaryAddress: '',
  city: '',
  state: '',
  pincode: '',
  
  previousSchool: '',
  previousGrade: '',
  admissionDate: '',
  admissionNumber: '',
  academicYear: '',
  
  medicalConditions: '',
  allergies: '',
  medications: '',
  doctorName: '',
  doctorPhone: '',
  
  transportRequired: false,
  pickupAddress: '',
  dropAddress: '',
  
  birthCertificate: null,
  transferCertificate: null,
  markSheets: null,
  medicalCertificate: null,
  passportPhoto: null,
  aadharCard: null,
  parentIdProof: null,
  otherDocuments: null,
}

export function useAdmissions() {
  const [loading, setLoading] = useState(false)
  const [studentForm, setStudentForm] = useState<StudentFormState>(initialStudentForm)
  const [activeFormSection, setActiveFormSection] = useState<'basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents'>('basic')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [selectedStudent, setSelectedStudent] = useState<StudentAdmissionData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState<StudentAdmissionData | null>(null)
  
  const [students, setStudents] = useState<StudentAdmissionData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('name')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false)
  
  const [admissionStats, setAdmissionStats] = useState<AdmissionStats>({
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
  })

  const fetchAdmissions = useCallback(async () => {
    setIsLoadingAdmissions(true)
    try {
      const url = new URL('/api/academic/students', window.location.origin)
      url.searchParams.set('page', currentPage.toString())
      url.searchParams.set('limit', '10')
      if (searchTerm) {
        url.searchParams.set('search', searchTerm)
        url.searchParams.set('field', searchField)
      }
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)
      if (selectedGrade !== 'all') url.searchParams.set('grade', selectedGrade)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || 0)
        
        // Calculate stats
        const all: StudentAdmissionData[] = data.students || []
        setAdmissionStats({
          approved: all.filter(s => s.status === 'ACCEPTED' || s.status === 'Approved').length,
          pending: all.filter(s => s.status === 'PENDING' || s.status === 'Pending').length,
          underReview: all.filter(s => s.status === 'UNDER_REVIEW' || s.status === 'Under Review').length,
          rejected: all.filter(s => s.status === 'REJECTED' || s.status === 'Rejected').length,
        })
      }
    } catch {
      toast.error('Failed to fetch admissions list')
    } finally {
      setIsLoadingAdmissions(false)
    }
  }, [currentPage, searchTerm, searchField, statusFilter, selectedGrade])

  useEffect(() => {
    fetchAdmissions()
  }, [fetchAdmissions])

  const handleFormChange = (field: keyof StudentFormState, value: any) => {
    setStudentForm(prev => ({ ...prev, [field]: value }))
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name || !studentForm.grade) {
      toast.error('Please fill required fields (Name and Grade)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/academic/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentForm.name,
          email: studentForm.email || undefined,
          age: parseInt(studentForm.age) || 10,
          grade: studentForm.grade,
          rollNumber: studentForm.rollNumber || undefined,
          parentContact: studentForm.parentContact || studentForm.parentPhone,
          address: studentForm.address || studentForm.permanentAddress,
          busRouteId: studentForm.busRouteId || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Student enrolled successfully')
        setStudentForm(initialStudentForm)
        fetchAdmissions()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to enroll student')
      }
    } catch {
      toast.error('Network error during student registration')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    studentForm,
    setStudentForm,
    handleFormChange,
    activeFormSection,
    setActiveFormSection,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    selectedStudent,
    setSelectedStudent,
    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    setIsEditing,
    editedStudent,
    setEditedStudent,
    students,
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    selectedGrade,
    setSelectedGrade,
    isLoadingAdmissions,
    admissionStats,
    fetchAdmissions,
    handleStudentSubmit,
  }
}
