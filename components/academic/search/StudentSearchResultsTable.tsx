'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { StudentSearchResult } from '../hooks/useAdvancedStudentSearch'

interface StudentSearchResultsTableProps {
  students: StudentSearchResult[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onPageChange: (page: number) => void
}

export const StudentSearchResultsTable: React.FC<StudentSearchResultsTableProps> = ({
  students,
  isLoading,
  pagination,
  onPageChange,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>
      case 'GRADUATED':
        return <Badge variant="secondary">Graduated</Badge>
      case 'INACTIVE':
        return <Badge variant="outline">Inactive</Badge>
      case 'SUSPENDED':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Searching student directory...</div>
  }

  if (students.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No students match your search criteria.</div>
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Grade & Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Parent Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.class?.batch?.batchName || 'N/A'}</TableCell>
                <TableCell>
                  {student.class?.grade?.gradeName || 'N/A'} - {student.class?.sectionName || 'N/A'}
                </TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {student.parentContact || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total students)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
