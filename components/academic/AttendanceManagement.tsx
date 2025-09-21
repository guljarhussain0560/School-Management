'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Upload, 
  Search, 
  Plus, 
  Edit, 
  Download,
  FileSpreadsheet,
  Users,
  BookOpen,
  CheckCircle,
  X,
  UserCheck,
  UserX
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import gradesData from '@/data/grades.json'
import subjectsData from '@/data/subjects.json'

interface Student {
  id: string
  studentId: string
  name: string
  rollNumber: string
  grade: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  isPresent: boolean
  student: Student
  marker: {
    name: string
  }
  createdAt: string
}

interface UploadResult {
  success: number
  errors: number
  total: number
  errorDetails: string[]
}

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState<'grade-wise' | 'subject-wise' | 'upload' | 'records'>('grade-wise')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  
  // Form states
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [editFormData, setEditFormData] = useState({
    date: '',
    isPresent: true
  })

  // Get available subjects for selected grade
  const availableSubjects = selectedGrade ? (subjectsData as any)[selectedGrade] || [] : []

  // Fetch students for selected grade
  const fetchStudents = async (grade: string) => {
    if (!grade) return
    
    try {
      const response = await fetch(`/api/academic/attendance/students?grade=${grade}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        
        // Initialize attendance data - DEFAULT TO ABSENT
        const initialAttendance: Record<string, boolean> = {}
        data.students.forEach((student: Student) => {
          initialAttendance[student.id] = false // Default to absent
        })
        setAttendanceData(initialAttendance)
      } else {
        toast.error('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Error fetching students')
    }
  }

  // Mark all students present
  const markAllPresent = () => {
    const allPresent: Record<string, boolean> = {}
    students.forEach(student => {
      allPresent[student.id] = true
    })
    setAttendanceData(allPresent)
    toast.success('All students marked as present')
  }

  // Mark all students absent
  const markAllAbsent = () => {
    const allAbsent: Record<string, boolean> = {}
    students.forEach(student => {
      allAbsent[student.id] = false
    })
    setAttendanceData(allAbsent)
    toast.success('All students marked as absent')
  }

  // Download Excel template
  const downloadExcelTemplate = () => {
    const templateData = students.map(student => ({
      'Student ID': student.studentId,
      'Student Name': student.name,
      'Roll Number': student.rollNumber,
      'Status': 'Present' // Default value
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Student ID
      { wch: 25 }, // Student Name
      { wch: 15 }, // Roll Number
      { wch: 12 }  // Status
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Template')
    
    // Generate filename
    const filename = `attendance_template_${selectedGrade}_${selectedDate}.xlsx`
    
    // Download file
    XLSX.writeFile(wb, filename)
    toast.success('Excel template downloaded successfully')
  }

  // Fetch attendance records
  const fetchAttendanceRecords = async (page = 1, search = '', grade = '', subject = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(grade && { grade }),
        ...(subject && { subject })
      })

      const endpoint = activeTab === 'grade-wise' 
        ? '/api/academic/attendance/grade-wise'
        : '/api/academic/attendance/subject-wise'

      const response = await fetch(`${endpoint}?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data.attendanceRecords)
        setTotalPages(data.pagination.pages)
        setTotalItems(data.pagination.total)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch attendance records')
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      toast.error('Error fetching attendance records')
    } finally {
      setLoading(false)
    }
  }

  // Handle attendance submission
  const handleSubmitAttendance = async () => {
    if (!selectedGrade || !selectedDate) {
      toast.error('Please select grade and date')
      return
    }

    if (activeTab === 'subject-wise' && !selectedSubject) {
      toast.error('Please select subject for subject-wise attendance')
      return
    }

    setLoading(true)
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id] ? 'PRESENT' : 'ABSENT'
      }))

      const requestBody = {
        date: selectedDate,
        grade: selectedGrade,
        ...(activeTab === 'subject-wise' && { subject: selectedSubject }),
        attendanceRecords
      }

      const endpoint = activeTab === 'grade-wise'
        ? '/api/academic/attendance/grade-wise'
        : '/api/academic/attendance/subject-wise'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        toast.success('Attendance recorded successfully')
        setSelectedGrade('')
        setSelectedSubject('')
        setStudents([])
        setAttendanceData({})
        fetchAttendanceRecords(currentPage, searchTerm, selectedGrade, selectedSubject)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to record attendance')
      }
    } catch (error) {
      console.error('Error recording attendance:', error)
      toast.error('Error recording attendance')
    } finally {
      setLoading(false)
    }
  }

  // Handle Excel upload
  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!selectedGrade || !selectedDate) {
      toast.error('Please select grade and date before uploading')
      return
    }

    if (activeTab === 'subject-wise' && !selectedSubject) {
      toast.error('Please select subject before uploading')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('grade', selectedGrade)
      formData.append('date', selectedDate)
      if (activeTab === 'subject-wise') {
        formData.append('subject', selectedSubject)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const endpoint = activeTab === 'grade-wise'
        ? '/api/academic/attendance/grade-wise/upload'
        : '/api/academic/attendance/subject-wise/upload'

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result.results)
        toast.success(`Upload completed: ${result.results.success} successful, ${result.results.errors} errors`)
        fetchAttendanceRecords(currentPage, searchTerm, selectedGrade, selectedSubject)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error uploading file')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchAttendanceRecords(1, searchTerm, selectedGrade, selectedSubject)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchAttendanceRecords(page, searchTerm, selectedGrade, selectedSubject)
  }

  // Open edit dialog
  const openEditDialog = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setEditFormData({
      date: record.date.split('T')[0],
      isPresent: record.isPresent
    })
    setDialogOpen(true)
  }

  // Handle dialog update
  const handleDialogUpdate = async () => {
    if (!editingRecord) return

    setLoading(true)
    try {
      const requestBody = {
        date: editFormData.date,
        grade: editingRecord.student.grade,
        ...(activeTab === 'subject-wise' && { subject: selectedSubject }),
        attendanceRecords: [{
          studentId: editingRecord.student.id,
          status: editFormData.isPresent ? 'PRESENT' : 'ABSENT'
        }]
      }

      const endpoint = activeTab === 'grade-wise'
        ? '/api/academic/attendance/grade-wise'
        : '/api/academic/attendance/subject-wise'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        toast.success('Attendance updated successfully')
        setDialogOpen(false)
        setEditingRecord(null)
        fetchAttendanceRecords(currentPage, searchTerm, selectedGrade, selectedSubject)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update attendance')
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      toast.error('Error updating attendance')
    } finally {
      setLoading(false)
    }
  }

  // Close edit dialog
  const closeEditDialog = () => {
    setDialogOpen(false)
    setEditingRecord(null)
    setEditFormData({ date: '', isPresent: true })
  }

  // Get attendance badge color
  const getAttendanceBadgeColor = (isPresent: boolean) => {
    return isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // Get attendance icon
  const getAttendanceIcon = (isPresent: boolean) => {
    return isPresent ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />
  }

  // Initial load
  useEffect(() => {
    if (activeTab === 'records') {
      fetchAttendanceRecords()
    }
  }, [activeTab])

  // Fetch students when grade changes
  useEffect(() => {
    if (selectedGrade) {
      fetchStudents(selectedGrade)
    }
  }, [selectedGrade])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Record and manage student attendance by grade or subject</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'grade-wise' | 'subject-wise' | 'upload' | 'records')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="grade-wise">Grade-wise Attendance</TabsTrigger>
          <TabsTrigger value="subject-wise">Subject-wise Attendance</TabsTrigger>
          <TabsTrigger value="upload">Excel Upload</TabsTrigger>
          <TabsTrigger value="records">View Records</TabsTrigger>
        </TabsList>

        <TabsContent value="grade-wise" className="space-y-4">
          {/* Grade-wise Attendance Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Grade-wise Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradesData.grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSubmitAttendance} 
                    disabled={loading || !selectedGrade || students.length === 0}
                    className="w-full"
                  >
                    {loading ? 'Recording...' : 'Record Attendance'}
                  </Button>
                </div>
              </div>

              {/* Students List */}
              {students.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Students ({students.length})</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllPresent}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAbsent}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Mark All Absent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadExcelTemplate}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">ID: {student.studentId} • Roll: {student.rollNumber}</p>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <Button
                            variant={attendanceData[student.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAttendanceData(prev => ({...prev, [student.id]: true}))}
                            className={attendanceData[student.id] ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-600 hover:bg-green-50"}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            variant={!attendanceData[student.id] ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setAttendanceData(prev => ({...prev, [student.id]: false}))}
                            className={!attendanceData[student.id] ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-600 hover:bg-red-50"}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Attendance Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Attendance Summary:</span>
                      <div className="flex gap-4">
                        <span className="text-green-600 font-medium">
                          Present: {Object.values(attendanceData).filter(Boolean).length}
                        </span>
                        <span className="text-red-600 font-medium">
                          Absent: {Object.values(attendanceData).filter(v => !v).length}
                        </span>
                        <span className="text-blue-600 font-medium">
                          Total: {students.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject-wise" className="space-y-4">
          {/* Subject-wise Attendance Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject-wise Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subject-grade">Grade *</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradesData.grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                    disabled={!selectedGrade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject: string) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject-date">Date *</Label>
                  <Input
                    id="subject-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSubmitAttendance} 
                    disabled={loading || !selectedGrade || !selectedSubject || students.length === 0}
                    className="w-full"
                  >
                    {loading ? 'Recording...' : 'Record Attendance'}
                  </Button>
                </div>
              </div>

              {/* Students List */}
              {students.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Students ({students.length})</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllPresent}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAbsent}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Mark All Absent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadExcelTemplate}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">ID: {student.studentId} • Roll: {student.rollNumber}</p>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <Button
                            variant={attendanceData[student.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAttendanceData(prev => ({...prev, [student.id]: true}))}
                            className={attendanceData[student.id] ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-600 hover:bg-green-50"}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            variant={!attendanceData[student.id] ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setAttendanceData(prev => ({...prev, [student.id]: false}))}
                            className={!attendanceData[student.id] ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-600 hover:bg-red-50"}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Attendance Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Attendance Summary:</span>
                      <div className="flex gap-4">
                        <span className="text-green-600 font-medium">
                          Present: {Object.values(attendanceData).filter(Boolean).length}
                        </span>
                        <span className="text-red-600 font-medium">
                          Absent: {Object.values(attendanceData).filter(v => !v).length}
                        </span>
                        <span className="text-blue-600 font-medium">
                          Total: {students.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          {/* Excel Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Excel Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📋 Excel Format Instructions</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Required Columns:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code>Student ID</code> - Student's unique ID (e.g., STU001)</li>
                    <li><code>Status</code> - Attendance status: "Present" or "Absent"</li>
                  </ul>
                  <p className="mt-2"><strong>Optional Columns:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code>Student Name</code> - For reference</li>
                    <li><code>Roll Number</code> - For reference</li>
                  </ul>
                  <p className="mt-2"><strong>Note:</strong> Download template below for exact format</p>
                </div>
              </div>

              {/* Download Template */}
              {students.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📥 Download Template</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Download a pre-filled Excel template with your selected grade's students
                  </p>
                  <Button
                    onClick={downloadExcelTemplate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template for {selectedGrade}
                  </Button>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload Attendance Data</p>
                  <p className="text-gray-500">Upload an Excel file (.xlsx, .xls) with attendance data</p>
                  <p className="text-sm text-gray-400">
                    Make sure to select grade and date first, then download template
                  </p>
                </div>
                
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="hidden"
                    id="attendance-file-upload"
                    disabled={uploading || !selectedGrade}
                  />
                  <Button asChild disabled={uploading || !selectedGrade}>
                    <label htmlFor="attendance-file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </Button>
                  {!selectedGrade && (
                    <p className="text-sm text-red-500 mt-2">Please select a grade first</p>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500 mt-2">{uploadProgress}% uploaded</p>
                  </div>
                )}

                {uploadResult && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>Upload Results:</strong></p>
                        <p>✅ Successful: {uploadResult.success}</p>
                        <p>❌ Errors: {uploadResult.errors}</p>
                        <p>📊 Total: {uploadResult.total}</p>
                        
                        {uploadResult.errorDetails.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
                            <ul className="mt-2 text-sm space-y-1">
                              {uploadResult.errorDetails.map((error, index) => (
                                <li key={index} className="text-red-600">• {error}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-grade">Filter by Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All grades</SelectItem>
                      {gradesData.grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeTab === 'subject-wise' && (
                  <div>
                    <Label htmlFor="filter-subject">Filter by Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All subjects</SelectItem>
                        {availableSubjects.map((subject: string) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Records ({totalItems} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.student.name}</TableCell>
                            <TableCell>{record.student.rollNumber}</TableCell>
                            <TableCell>{record.student.grade}</TableCell>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getAttendanceBadgeColor(record.isPresent)}>
                                <div className="flex items-center gap-1">
                                  {getAttendanceIcon(record.isPresent)}
                                  {record.isPresent ? 'Present' : 'Absent'}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>{record.marker.name}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(record)}
                                title="Edit attendance"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-status">Status *</Label>
              <Select 
                value={editFormData.isPresent ? 'present' : 'absent'} 
                onValueChange={(value) => setEditFormData({...editFormData, isPresent: value === 'present'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleDialogUpdate} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Attendance'}
              </Button>
              <Button 
                variant="outline" 
                onClick={closeEditDialog}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
