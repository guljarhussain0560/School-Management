import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, X, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import { StudentAttendanceItem } from '../hooks/useAcademicView'

interface AttendanceSectionProps {
  showForm: boolean
  setShowForm: (show: boolean) => void
  form: {
    date: string
    students: StudentAttendanceItem[]
  }
  setForm: React.Dispatch<React.SetStateAction<{
    date: string
    students: StudentAttendanceItem[]
  }>>
  onSubmit: (e: React.FormEvent) => void
  toggleAttendance: (id: string) => void
  setAllAttendance: (present: boolean) => void
  loading: boolean
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  showForm,
  setShowForm,
  form,
  setForm,
  onSubmit,
  toggleAttendance,
  setAllAttendance,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Attendance Management</CardTitle>
            <CardDescription>
              Mark and review student daily attendance records
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'Take Attendance'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-1">
                <Label htmlFor="att-date">Attendance Date</Label>
                <Input
                  id="att-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllAttendance(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  Mark All Present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllAttendance(false)}
                >
                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                  Mark All Absent
                </Button>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant={student.present ? 'default' : 'destructive'}>
                          {student.present ? 'Present' : 'Absent'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAttendance(student.id)}
                        >
                          Toggle Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting Attendance...' : 'Save Attendance'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>Click &quot;Take Attendance&quot; to record student attendance for today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
