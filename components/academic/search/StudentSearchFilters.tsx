'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw } from 'lucide-react'
import { StudentBatch, Grade, Section } from '../hooks/useAdvancedStudentSearch'

interface StudentSearchFiltersProps {
  filters: {
    searchTerm: string
    batchId: string
    gradeId: string
    sectionId: string
    status: string
  }
  setFilters: React.Dispatch<React.SetStateAction<any>>
  batches: StudentBatch[]
  grades: Grade[]
  sections: Section[]
  onSearch: () => void
  onReset: () => void
  isLoading: boolean
}

export const StudentSearchFilters: React.FC<StudentSearchFiltersProps> = ({
  filters,
  setFilters,
  batches,
  grades,
  sections,
  onSearch,
  onReset,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll no, or ID..."
            value={filters.searchTerm}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.batchId}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, batchId: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.batchName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.gradeId}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, gradeId: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.gradeName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, status: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="GRADUATED">Graduated</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button size="sm" onClick={onSearch} disabled={isLoading} className="flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5" />
          {isLoading ? 'Searching...' : 'Search Students'}
        </Button>
      </div>
    </div>
  )
}
