import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface Student {
  id: string
  name: string
  classId?: string
}

export interface Assignment {
  id: string
  title: string
  description?: string
  subjectId?: string
  subject?: { subjectName: string }
  classId?: string
  class?: { className: string; classCode: string }
  dueDate: string
  totalMarks?: number
  status?: string
}

export interface TeacherAssignmentItem {
  id: string
  teacherId: string
  teacher?: { name: string; email: string }
  subjectId: string
  subject?: { subjectName: string }
  classId: string
  class?: { className: string }
}

export interface CurriculumProgressItem {
  id: string
  subject: string
  grade: string
  module: string
  progress: number | string
}

export interface StudentAttendanceItem {
  id: string
  name: string
  present: boolean
}

export function useAcademicView() {
  const [activeTab, setActiveTab] = useState('performance')
  const [loading, setLoading] = useState(false)

  // Data states
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentItem[]>([])
  const [curriculumProgress, setCurriculumProgress] = useState<CurriculumProgressItem[]>([])

  // Form visibility states
  const [showPerformanceForm, setShowPerformanceForm] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [showCurriculumForm, setShowCurriculumForm] = useState(false)

  // Performance form state
  const [performanceForm, setPerformanceForm] = useState({
    studentId: '',
    subject: '',
    grade: '',
    marks: '',
    maxMarks: '',
    examType: 'Quiz',
    examDate: '',
    remarks: '',
  })

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState<{
    date: string
    students: StudentAttendanceItem[]
  }>({
    date: new Date().toISOString().split('T')[0],
    students: [],
  })

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    dueDate: '',
    totalMarks: '',
  })

  // Curriculum form state
  const [curriculumForm, setCurriculumForm] = useState({
    subject: '',
    grade: '',
    module: '',
    progress: '',
  })

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/academic/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      logger.error('Error fetching students', error as Error, { context: 'useAcademicView' })
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/academic/assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])
      }
    } catch (error) {
      logger.error('Error fetching assignments', error as Error, { context: 'useAcademicView' })
    }
  }

  const fetchTeacherAssignments = async () => {
    try {
      const response = await fetch('/api/academic/teacher-assignments')
      if (response.ok) {
        const data = await response.json()
        setTeacherAssignments(data.assignments || [])
      }
    } catch (error) {
      logger.error('Error fetching teacher assignments', error as Error, { context: 'useAcademicView' })
    }
  }

  const fetchCurriculumProgress = async () => {
    try {
      const response = await fetch('/api/academic/curriculum-progress')
      if (response.ok) {
        const data = await response.json()
        setCurriculumProgress(data.progress || [])
      }
    } catch (error) {
      logger.error('Error fetching curriculum progress', error as Error, { context: 'useAcademicView' })
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchAssignments()
    fetchTeacherAssignments()
    fetchCurriculumProgress()
  }, [])

  // Initialize attendance form with students
  useEffect(() => {
    if (students.length > 0) {
      setAttendanceForm(prev => ({
        ...prev,
        students: students.map(student => ({
          id: student.id,
          name: student.name,
          present: true,
        })),
      }))
    }
  }, [students])

  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performanceForm),
      })

      if (response.ok) {
        toast.success('Student performance recorded successfully')
        setPerformanceForm({
          studentId: '',
          subject: '',
          grade: '',
          marks: '',
          maxMarks: '',
          examType: 'Quiz',
          examDate: '',
          remarks: '',
        })
        setShowPerformanceForm(false)
      } else {
        toast.error('Failed to record performance')
      }
    } catch (error) {
      logger.error('Error recording performance', error as Error)
      toast.error('Error recording performance')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const attendanceData = attendanceForm.students.map(student => ({
        studentId: student.id,
        status: student.present ? 'PRESENT' : 'ABSENT',
      }))

      const response = await fetch('/api/academic/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceForm.date,
          grade: 'General',
          attendanceRecords: attendanceData,
        }),
      })

      if (response.ok) {
        toast.success('Attendance recorded successfully')
        setShowAttendanceForm(false)
      } else {
        toast.error('Failed to record attendance')
      }
    } catch (error) {
      logger.error('Error recording attendance', error as Error)
      toast.error('Error recording attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm),
      })

      if (response.ok) {
        toast.success('Assignment created successfully')
        setAssignmentForm({
          title: '',
          description: '',
          subject: '',
          grade: '',
          dueDate: '',
          totalMarks: '',
        })
        setShowAssignmentForm(false)
        fetchAssignments()
      } else {
        toast.error('Failed to create assignment')
      }
    } catch (error) {
      logger.error('Error creating assignment', error as Error)
      toast.error('Error creating assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/curriculum-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curriculumForm),
      })

      if (response.ok) {
        toast.success('Curriculum progress updated successfully')
        setCurriculumForm({ subject: '', grade: '', module: '', progress: '' })
        setShowCurriculumForm(false)
        fetchCurriculumProgress()
      } else {
        toast.error('Failed to update curriculum progress')
      }
    } catch (error) {
      logger.error('Error updating curriculum progress', error as Error)
      toast.error('Error updating curriculum progress')
    } finally {
      setLoading(false)
    }
  }

  const toggleStudentAttendance = (studentId: string) => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(s =>
        s.id === studentId ? { ...s, present: !s.present } : s
      ),
    }))
  }

  const setAllAttendance = (present: boolean) => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(s => ({ ...s, present })),
    }))
  }

  return {
    activeTab,
    setActiveTab,
    loading,
    students,
    assignments,
    teacherAssignments,
    curriculumProgress,
    showPerformanceForm,
    setShowPerformanceForm,
    showAttendanceForm,
    setShowAttendanceForm,
    showAssignmentForm,
    setShowAssignmentForm,
    showCurriculumForm,
    setShowCurriculumForm,
    performanceForm,
    setPerformanceForm,
    attendanceForm,
    setAttendanceForm,
    assignmentForm,
    setAssignmentForm,
    curriculumForm,
    setCurriculumForm,
    handlePerformanceSubmit,
    handleAttendanceSubmit,
    handleAssignmentSubmit,
    handleCurriculumSubmit,
    toggleStudentAttendance,
    setAllAttendance,
  }
}
