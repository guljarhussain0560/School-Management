'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, ChevronLeft, ChevronRight, RefreshCw, UserCheck } from 'lucide-react'
import { StudentAdmissionData } from './types'

interface AdmissionsListTableProps {
  students: StudentAdmissionData[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  totalCount: number
  searchTerm: string
  searchField: string
  statusFilter: string
  selectedGrade: string
  onSearchChange: (val: string) => void
  onFieldChange: (val: string) => void
  onStatusChange: (val: string) => void
  onGradeChange: (val: string) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
  onViewStudent: (student: StudentAdmissionData) => void
}

export function AdmissionsListTable({
  students,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  searchTerm,
  searchField,
  statusFilter,
  selectedGrade,
  onSearchChange,
  onFieldChange,
  onStatusChange,
  onGradeChange,
  onPageChange,
  onRefresh,
  onViewStudent,
}: AdmissionsListTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
      case 'APPROVED':
        return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300">Approved</Badge>
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/20 border-blue-300">Under Review</Badge>
      case 'REJECTED':
        return <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/20 border-rose-300">Rejected</Badge>
      default:
        return <Badge variant="outline" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 border-amber-300">Pending</Badge>
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Admissions Roster</CardTitle>
            <CardDescription>Search, filter, and inspect registered students and applicant status ({totalCount} records)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="self-start md:self-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-2 border-t">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={searchField} onValueChange={onFieldChange}>
            <SelectTrigger>
              <SelectValue placeholder="Search by Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Student Name</SelectItem>
              <SelectItem value="studentId">Student ID</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="rollNumber">Roll Number</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="Grade 1">Grade 1</SelectItem>
              <SelectItem value="Grade 5">Grade 5</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACCEPTED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">ID / Roll</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Parent Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">Loading admissions data...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">No students found matching your criteria.</td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id || student.studentId || idx} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email || 'No email provided'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {student.studentId || 'N/A'} {student.rollNumber ? `(Roll ${student.rollNumber})` : ''}
                    </td>
                    <td className="px-4 py-3">{student.grade || 'Standard'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.parentContact || student.parentPhone || '—'}</td>
                    <td className="px-4 py-3">{getStatusBadge(student.status || student.admissionStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onViewStudent(student)} className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4 text-primary" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between mt-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Showing Page {currentPage} of {totalPages} ({totalCount} total entries)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
