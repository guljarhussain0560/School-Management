import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, BarChart3 } from 'lucide-react'
import { Student } from '../hooks/useAcademicView'

interface PerformanceSectionProps {
  students: Student[]
  showForm: boolean
  setShowForm: (show: boolean) => void
  form: {
    studentId: string
    subject: string
    grade: string
    marks: string
    maxMarks: string
    examType: string
    examDate: string
    remarks: string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    studentId: string
    subject: string
    grade: string
    marks: string
    maxMarks: string
    examType: string
    examDate: string
    remarks: string
  }>>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  students,
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
            <CardTitle>Student Performance Tracking</CardTitle>
            <CardDescription>
              Record and track academic performance, test scores, and assessments
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'Record Marks'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={onSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(val) => setForm(prev => ({ ...prev, studentId: val }))}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade / Class</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g. 10th"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Marks Obtained</Label>
                <Input
                  id="marks"
                  type="number"
                  value={form.marks}
                  onChange={(e) => setForm(prev => ({ ...prev, marks: e.target.value }))}
                  placeholder="e.g. 85"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMarks">Max Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={form.maxMarks}
                  onChange={(e) => setForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                  placeholder="e.g. 100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Select
                  value={form.examType}
                  onValueChange={(val) => setForm(prev => ({ ...prev, examType: val }))}
                >
                  <SelectTrigger id="examType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={form.remarks}
                onChange={(e) => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Additional feedback..."
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Performance Record'}
            </Button>
          </form>
        )}

        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="mx-auto h-12 w-12 opacity-30 mb-2" />
          <p>Select a student to view academic analytics, grade trends, and test results.</p>
        </div>
      </CardContent>
    </Card>
  )
}
