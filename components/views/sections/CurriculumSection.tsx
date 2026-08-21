import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, X, BookOpen } from 'lucide-react'
import { CurriculumProgressItem } from '../hooks/useAcademicView'

interface CurriculumSectionProps {
  curriculumProgress: CurriculumProgressItem[]
  showForm: boolean
  setShowForm: (show: boolean) => void
  form: {
    subject: string
    grade: string
    module: string
    progress: string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    subject: string
    grade: string
    module: string
    progress: string
  }>>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  curriculumProgress,
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
            <CardTitle>Syllabus & Curriculum Progress</CardTitle>
            <CardDescription>
              Track course coverage and completion status across grades
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'Update Progress'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={onSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cur-subject">Subject</Label>
                <Input
                  id="cur-subject"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cur-grade">Grade / Class</Label>
                <Input
                  id="cur-grade"
                  value={form.grade}
                  onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g. 10th Grade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module">Module / Chapter Name</Label>
                <Input
                  id="module"
                  value={form.module}
                  onChange={(e) => setForm(prev => ({ ...prev, module: e.target.value }))}
                  placeholder="e.g. Module 3: Thermodynamics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Completion % (0-100)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) => setForm(prev => ({ ...prev, progress: e.target.value }))}
                  placeholder="e.g. 75"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Save Curriculum Progress'}
            </Button>
          </form>
        )}

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Module</TableHead>
                <TableHead className="w-[30%]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {curriculumProgress.length > 0 ? (
                curriculumProgress.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{item.module}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={Number(item.progress)} className="h-2 flex-1" />
                        <span className="text-xs font-semibold">{item.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 opacity-30 mb-1" />
                    No curriculum tracking data found.
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
