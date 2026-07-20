'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, X, UserCheck, UserX, Save } from 'lucide-react'

export interface StudentAttendanceItem {
  id: string
  studentId: string
  name: string
  rollNumber?: string
  grade: string
}

interface GradeAttendanceSectionProps {
  students: StudentAttendanceItem[]
  selectedGrade: string
  selectedDate: string
  attendanceData: Record<string, boolean>
  loading: boolean
  onGradeChange: (grade: string) => void
  onDateChange: (date: string) => void
  onToggleStatus: (studentId: string, isPresent: boolean) => void
  onMarkAll: (isPresent: boolean) => void
  onSubmit: () => void
}

export function GradeAttendanceSection({
  students,
  selectedGrade,
  selectedDate,
  attendanceData,
  loading,
  onGradeChange,
  onDateChange,
  onToggleStatus,
  onMarkAll,
  onSubmit,
}: GradeAttendanceSectionProps) {
  const presentCount = Object.values(attendanceData).filter(Boolean).length
  const absentCount = students.length - presentCount

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Class Attendance Register</CardTitle>
        <CardDescription>Select standard grade and mark individual or batch student presence</CardDescription>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="space-y-1.5">
            <Label>Select Grade / Class</Label>
            <Select value={selectedGrade} onValueChange={onGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grade 1">Grade 1</SelectItem>
                <SelectItem value="Grade 2">Grade 2</SelectItem>
                <SelectItem value="Grade 3">Grade 3</SelectItem>
                <SelectItem value="Grade 4">Grade 4</SelectItem>
                <SelectItem value="Grade 5">Grade 5</SelectItem>
                <SelectItem value="Grade 6">Grade 6</SelectItem>
                <SelectItem value="Grade 7">Grade 7</SelectItem>
                <SelectItem value="Grade 8">Grade 8</SelectItem>
                <SelectItem value="Grade 9">Grade 9</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Attendance Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={e => onDateChange(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMarkAll(true)}
              className="flex-1 text-emerald-600"
            >
              <UserCheck className="w-4 h-4 mr-1" /> Mark All Present
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMarkAll(false)}
              className="flex-1 text-rose-600"
            >
              <UserX className="w-4 h-4 mr-1" /> Mark All Absent
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {selectedGrade && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">Total Enrolled: {students.length}</span>
            <div className="flex gap-4">
              <span className="text-emerald-600 font-medium">Present: {presentCount}</span>
              <span className="text-rose-600 font-medium">Absent: {absentCount}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Roll / ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    {selectedGrade ? 'No students enrolled in this grade.' : 'Please select a grade to load roster.'}
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const isPresent = attendanceData[student.id] !== false
                  return (
                    <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{student.rollNumber || student.studentId}</td>
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isPresent ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {isPresent ? 'PRESENT' : 'ABSENT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={isPresent ? 'default' : 'outline'}
                            onClick={() => onToggleStatus(student.id, true)}
                            className="h-8"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Present
                          </Button>
                          <Button
                            size="sm"
                            variant={!isPresent ? 'destructive' : 'outline'}
                            onClick={() => onToggleStatus(student.id, false)}
                            className="h-8"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Absent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="flex justify-end mt-4 pt-3 border-t">
            <Button onClick={onSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving Attendance...' : 'Save Daily Attendance'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
