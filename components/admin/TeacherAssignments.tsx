'use client'

import { logger } from '@/lib/logger'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Search, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface TeacherAssignment {
  id: string
  teacherId: string
  subjectId: string
  classId: string
  teacher: {
    id: string
    name: string
    email: string
  }
  subject: {
    id: string
    subjectName: string
    subjectCode: string
  }
  class: {
    id: string
    className: string
    classCode: string
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  role: 'TEACHER'
}

interface AssignmentFormData {
  teacherId: string
  subjectId: string
  classId: string
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<AssignmentFormData>({
    teacherId: '',
    subjectId: '',
    classId: ''
  })
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/academic/teacher-assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Failed to fetch teacher assignments:', { status: response.status, error: errorData })
        toast.error('Failed to fetch teacher assignments')
      }
    } catch (error) {
      logger.error('Error fetching teacher assignments:', error)
      toast.error('Error fetching teacher assignments')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users?role=TEACHER')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.users || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Failed to fetch teachers:', { status: response.status, error: errorData })
      }
    } catch (error) {
      logger.error('Error fetching teachers:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Failed to fetch subjects:', { status: response.status, error: errorData })
      }
    } catch (error) {
      logger.error('Error fetching subjects:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/academic/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Failed to fetch classes:', { status: response.status, error: errorData })
      }
    } catch (error) {
      logger.error('Error fetching classes:', error)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/academic/teacher-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Teacher assignment created successfully')
        setFormData({ teacherId: '', subjectId: '', classId: '' })
        setIsCreateDialogOpen(false)
        fetchAssignments()
      } else {
        const error = await response.json()
        logger.error('Failed to create teacher assignment:', { error, formData })
        toast.error(error.error || 'Failed to create teacher assignment')
      }
    } catch (error) {
      logger.error('Error creating teacher assignment:', error)
      toast.error('Error creating teacher assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/academic/teacher-assignments?id=${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Teacher assignment deleted successfully')
        fetchAssignments()
      } else {
        const error = await response.json()
        logger.error('Failed to delete teacher assignment:', { error, assignmentId })
        toast.error(error.error || 'Failed to delete teacher assignment')
      }
    } catch (error) {
      logger.error('Error deleting teacher assignment:', error)
      toast.error('Error deleting teacher assignment')
    }
  }

  useEffect(() => {
    fetchAssignments()
    fetchTeachers()
    fetchSubjects()
    fetchClasses()
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((assignment.class as any)?.className || (assignment.class as any)?.classCode || "N/A").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || assignment.subject?.id === subjectFilter
    const matchesClass = classFilter === 'all' || assignment.class?.id === classFilter

    return matchesSearch && matchesSubject && matchesClass
  })

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teacher Assignments
            </CardTitle>
            <CardDescription>
              Assign teachers to subjects and grades
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Teacher Assignment</DialogTitle>
                <DialogDescription>
                  Assign a teacher to teach a specific subject and grade.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Teacher</label>
                  <Select value={formData.teacherId} onValueChange={(val) => setFormData(prev => ({ ...prev, teacherId: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={formData.subjectId} onValueChange={(val) => setFormData(prev => ({ ...prev, subjectId: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.subjectName || s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Class</label>
                  <Select value={formData.classId} onValueChange={(val) => setFormData(prev => ({ ...prev, classId: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.className || c.name || c.classCode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={!formData.teacherId || !formData.subjectId || !formData.classId}>Assign</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.subjectName || s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.className || c.name || c.classCode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  No assignments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.teacher?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{a.subject?.subjectName}</Badge>
                  </TableCell>
                  <TableCell>{(a.class as any)?.className || (a.class as any)?.classCode || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this teacher assignment?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAssignment(a.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
