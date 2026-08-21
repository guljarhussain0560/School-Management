'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Clock, Award } from 'lucide-react'
import { Exam } from '../hooks/useExamManagement'

interface ExamListTableProps {
  exams: Exam[]
  loading: boolean
  onDelete: (id: string) => void
}

export const ExamListTable: React.FC<ExamListTableProps> = ({ exams, loading, onDelete }) => {
  const getExamTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      MIDTERM: { label: 'Midterm', variant: 'default' },
      FINAL: { label: 'Final', variant: 'default' },
      QUIZ: { label: 'Quiz', variant: 'secondary' },
      UNIT_TEST: { label: 'Unit Test', variant: 'outline' },
    }
    const info = variants[type] || { label: type, variant: 'outline' }
    return <Badge variant={info.variant}>{info.label}</Badge>
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading exams...</div>
  }

  if (exams.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No exams found matching your criteria.</div>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Marks (Total/Pass)</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.examName}</TableCell>
              <TableCell>{getExamTypeBadge(exam.examType)}</TableCell>
              <TableCell>{exam.subject?.subjectName || 'N/A'}</TableCell>
              <TableCell>{exam.class?.className || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{exam.totalMarks} / {exam.passingMarks}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{exam.duration} mins</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={exam.isActive ? 'default' : 'secondary'}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(exam.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
