'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Search, Edit, Trash2, Users, BookOpen } from 'lucide-react'
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
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])

  useEffect(() => {
    fetchAssignments()
    fetchTeachers()
    fetchSubjects()
    fetchClasses()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/academic/teacher-assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])
      } else {
        toast.error('Failed to fetch teacher assignments')
      }
    } catch (error) {
      console.error('Error fetching teacher assignments:', error)
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
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
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
      console.error('Error fetching classes:', error)
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
        toast.error(error.error || 'Failed to create teacher assignment')
      }
    } catch (error) {
      console.error('Error creating teacher assignment:', error)
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
        toast.error('Failed to delete teacher assignment')
      }
    } catch (error) {
      console.error('Error deleting teacher assignment:', error)
      toast.error('Error deleting teacher assignment')
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.class.className.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || assignment.subject.id === subjectFilter
    const matchesClass = classFilter === 'all' || assignment.class.id === classFilter

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
                  <label className="block text-sm font-medium mb-1">Teacher</label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData({ ...formData, classId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem: any) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Create Assignment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classItem: any) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignments Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No teacher assignments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.teacher.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.subject.subjectName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.class.className}</Badge>
                    </TableCell>
                    <TableCell>{assignment.teacher.email}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Teacher Assignment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {assignment.teacher.name} from teaching {assignment.subject.subjectName} in {assignment.class.className}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
