'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Upload, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  X as XIcon
} from 'lucide-react'
import { toast } from 'sonner'
import gradesData from '@/data/grades.json'
import subjectsData from '@/data/subjects.json'

interface CurriculumItem {
  id: string
  subject: string
  grade: string
  module: string
  progress: number
  updatedAt: string
  updater: {
    name: string
  }
}

interface CurriculumSummary {
  totalModules: number
  averageProgress: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  byGrade: Record<string, any>
  bySubject: Record<string, any>
  recentUpdates: CurriculumItem[]
}

interface UploadResult {
  success: number
  errors: number
  total: number
  errorDetails: string[]
}

export default function CurriculumManagement() {
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [summary, setSummary] = useState<CurriculumSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  
  // Form states
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [module, setModule] = useState('')
  const [progress, setProgress] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CurriculumItem | null>(null)
  const [dialogFormData, setDialogFormData] = useState({
    grade: '',
    subject: '',
    module: '',
    progress: ''
  })
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Get available subjects for selected grade
  const availableSubjects = selectedGrade && selectedGrade !== 'all' ? (subjectsData as any)[selectedGrade] || [] : []

  // Fetch curriculum data
  const fetchCurriculum = async (page = 1, search = '', grade = '', subject = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(grade && { grade }),
        ...(subject && { subject })
      })

      const response = await fetch(`/api/academic/curriculum?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCurriculum(data.curriculum)
        setTotalPages(data.pagination.pages)
        setTotalItems(data.pagination.total)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch curriculum data')
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error)
      toast.error('Error fetching curriculum data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary data
  const fetchSummary = async (grade = '', subject = '') => {
    try {
      const params = new URLSearchParams()
      if (grade) params.append('grade', grade)
      if (subject) params.append('subject', subject)

      const response = await fetch(`/api/academic/curriculum/summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGrade || selectedGrade === 'all' || !selectedSubject || selectedSubject === 'all' || !module || !progress) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/academic/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          module,
          progress: parseFloat(progress)
        })
      })

      if (response.ok) {
        toast.success('Curriculum progress updated successfully')
        setSelectedGrade('all')
        setSelectedSubject('all')
        setModule('')
        setProgress('')
        setEditingId(null)
        const gradeFilter = selectedGrade === 'all' ? '' : selectedGrade
        const subjectFilter = selectedSubject === 'all' ? '' : selectedSubject
        fetchCurriculum(currentPage, searchTerm, gradeFilter, subjectFilter)
        fetchSummary(gradeFilter, subjectFilter)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update curriculum')
      }
    } catch (error) {
      console.error('Error updating curriculum:', error)
      toast.error('Error updating curriculum')
    } finally {
      setLoading(false)
    }
  }

  // Handle Excel upload
  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

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

      const response = await fetch('/api/academic/curriculum/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result.results)
        toast.success(`Upload completed: ${result.results.success} successful, ${result.results.errors} errors`)
        const gradeFilter = selectedGrade === 'all' ? '' : selectedGrade
        const subjectFilter = selectedSubject === 'all' ? '' : selectedSubject
        fetchCurriculum(currentPage, searchTerm, gradeFilter, subjectFilter)
        fetchSummary(gradeFilter, subjectFilter)
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
    const gradeFilter = selectedGrade === 'all' ? '' : selectedGrade
    const subjectFilter = selectedSubject === 'all' ? '' : selectedSubject
    fetchCurriculum(1, searchTerm, gradeFilter, subjectFilter)
    fetchSummary(gradeFilter, subjectFilter)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const gradeFilter = selectedGrade === 'all' ? '' : selectedGrade
    const subjectFilter = selectedSubject === 'all' ? '' : selectedSubject
    fetchCurriculum(page, searchTerm, gradeFilter, subjectFilter)
  }

  // Edit curriculum item
  const handleEdit = (item: CurriculumItem) => {
    setSelectedGrade(item.grade)
    setSelectedSubject(item.subject)
    setModule(item.module)
    setProgress(item.progress.toString())
    setEditingId(item.id)
  }

  // Handle dialog update
  const handleDialogUpdate = async () => {
    const { grade, subject, module, progress } = dialogFormData

    if (!grade || !subject || !module || !progress) {
      toast.error('Please fill in all fields')
      return
    }

    const progressNum = parseFloat(progress)
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      toast.error('Progress must be a number between 0 and 100')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/academic/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          grade,
          module,
          progress: progressNum
        })
      })

      if (response.ok) {
        toast.success('Curriculum updated successfully')
        const gradeFilter = selectedGrade === 'all' ? '' : selectedGrade
        const subjectFilter = selectedSubject === 'all' ? '' : selectedSubject
        fetchCurriculum(currentPage, searchTerm, gradeFilter, subjectFilter)
        fetchSummary(gradeFilter, subjectFilter)
        setDialogOpen(false)
        setEditingItem(null)
        setDialogFormData({ grade: '', subject: '', module: '', progress: '' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update curriculum')
      }
    } catch (error) {
      console.error('Error updating curriculum:', error)
      toast.error('Error updating curriculum')
    } finally {
      setLoading(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (item: CurriculumItem) => {
    setEditingItem(item)
    setDialogFormData({
      grade: item.grade,
      subject: item.subject,
      module: item.module,
      progress: item.progress.toString()
    })
    setDialogOpen(true)
  }

  // Close edit dialog
  const closeEditDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setDialogFormData({ grade: '', subject: '', module: '', progress: '' })
  }

  // Get progress badge color
  const getProgressBadgeColor = (progress: number) => {
    if (progress === 100) return 'bg-green-100 text-green-800'
    if (progress > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Get progress icon
  const getProgressIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle className="h-4 w-4" />
    if (progress > 0) return <Clock className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  // Initial load
  useEffect(() => {
    fetchCurriculum()
    fetchSummary()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curriculum Management</h2>
          <p className="text-gray-600">Track and manage curriculum progress across grades and subjects</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Curriculum
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add/Update Curriculum Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="module">Module *</Label>
                <Input
                  id="module"
                  placeholder="Enter module name"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="progress">Progress (%) *</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter progress percentage"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Curriculum
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="upload">Excel Upload</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
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
                    placeholder="Search modules..."
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
                <div>
                  <Label htmlFor="filter-subject">Filter by Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {availableSubjects.length > 0 ? availableSubjects.map((subject: string) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      )) : (
                        <SelectItem value="no-subjects" disabled>
                          Select a grade first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Curriculum Progress ({totalItems} items)
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
                          <TableHead>Grade</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Module</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Updated By</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {curriculum.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.grade}</TableCell>
                            <TableCell>{item.subject}</TableCell>
                            <TableCell>{item.module}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={item.progress} className="w-20" />
                                <Badge className={getProgressBadgeColor(item.progress)}>
                                  {item.progress}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{item.updater.name}</TableCell>
                            <TableCell>
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(item)}
                                title="Edit curriculum"
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

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Excel Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload Curriculum Data</p>
                  <p className="text-gray-500">Upload an Excel file (.xlsx, .xls) with curriculum progress data</p>
                  <p className="text-sm text-gray-400">
                    Required columns: subject, grade, module, progress
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
                    id="file-upload"
                    disabled={uploading}
                  />
                  <Button asChild disabled={uploading}>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </Button>
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

        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <>
              {/* Overall Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{summary.totalModules}</p>
                        <p className="text-gray-500">Total Modules</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{summary.averageProgress}%</p>
                        <p className="text-gray-500">Average Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{summary.completedModules}</p>
                        <p className="text-gray-500">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">{summary.inProgressModules}</p>
                        <p className="text-gray-500">In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Grade-wise Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(summary.byGrade).map(([grade, data]: [string, any]) => (
                      <div key={grade} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{grade}</span>
                          <span className="text-sm text-gray-500">
                            {data.completedModules}/{data.totalModules} completed
                          </span>
                        </div>
                        <Progress value={data.averageProgress} className="w-full" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Avg: {data.averageProgress}%</span>
                          <span>In Progress: {data.inProgressModules}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(summary.bySubject).map(([subject, data]: [string, any]) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{subject}</span>
                          <span className="text-sm text-gray-500">
                            {data.completedModules}/{data.totalModules} completed
                          </span>
                        </div>
                        <Progress value={data.averageProgress} className="w-full" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Avg: {data.averageProgress}%</span>
                          <span>In Progress: {data.inProgressModules}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.recentUpdates.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getProgressIcon(item.progress)}
                          <div>
                            <p className="font-medium">{item.module}</p>
                            <p className="text-sm text-gray-500">{item.grade} - {item.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getProgressBadgeColor(item.progress)}>
                            {item.progress}%
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Curriculum Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dialog-grade">Grade *</Label>
              <Select 
                value={dialogFormData.grade} 
                onValueChange={(value) => setDialogFormData({...dialogFormData, grade: value})}
              >
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
              <Label htmlFor="dialog-subject">Subject *</Label>
              <Select 
                value={dialogFormData.subject} 
                onValueChange={(value) => setDialogFormData({...dialogFormData, subject: value})}
                disabled={!dialogFormData.grade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {(subjectsData as any)[dialogFormData.grade]?.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dialog-module">Module *</Label>
              <Input
                id="dialog-module"
                placeholder="Enter module name"
                value={dialogFormData.module}
                onChange={(e) => setDialogFormData({...dialogFormData, module: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="dialog-progress">Progress (%) *</Label>
              <Input
                id="dialog-progress"
                type="number"
                min="0"
                max="100"
                placeholder="Enter progress percentage"
                value={dialogFormData.progress}
                onChange={(e) => setDialogFormData({...dialogFormData, progress: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleDialogUpdate} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Curriculum'}
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
