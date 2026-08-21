import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, X, BookOpen, Calendar } from 'lucide-react'
import { Assignment } from '../hooks/useAcademicView'

interface AssignmentSectionProps {
  assignments: Assignment[]
  showForm: boolean
  setShowForm: (show: boolean) => void
  form: {
    title: string
    description: string
    subject: string
    grade: string
    dueDate: string
    totalMarks: string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    title: string
    description: string
    subject: string
    grade: string
    dueDate: string
    totalMarks: string
  }>>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  assignments,
  showForm,
  setShowForm,
  form,
  setForm,
  onSubmit,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Course Assignments</CardTitle>
            <CardDescription>
              Manage student homework, projects, and submission deadlines
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'Create Assignment'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={onSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Chapter 4 Trigonometry Problem Set"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asg-subject">Subject</Label>
                <Input
                  id="asg-subject"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asg-grade">Grade / Class</Label>
                <Input
                  id="asg-grade"
                  value={form.grade}
                  onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g. 10th Grade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm(prev => ({ ...prev, totalMarks: e.target.value }))}
                  placeholder="e.g. 50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asg-description">Description & Guidelines</Label>
              <Textarea
                id="asg-description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Instructions for students..."
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Publish Assignment'}
            </Button>
          </form>
        )}

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((asg) => (
                  <TableRow key={asg.id}>
                    <TableCell className="font-medium">{asg.title}</TableCell>
                    <TableCell>{asg.subject?.subjectName || 'General'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(asg.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{asg.status || 'Active'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 opacity-30 mb-1" />
                    No assignments published yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
