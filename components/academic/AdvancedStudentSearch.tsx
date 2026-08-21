'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Users } from 'lucide-react'
import { useAdvancedStudentSearch } from './hooks/useAdvancedStudentSearch'
import { StudentSearchFilters } from './search/StudentSearchFilters'
import { StudentSearchResultsTable } from './search/StudentSearchResultsTable'

export default function AdvancedStudentSearch() {
  const {
    students,
    batches,
    grades,
    sections,
    isLoading,
    searchFilters,
    setSearchFilters,
    pagination,
    executeSearch,
    exportToExcel,
    resetFilters,
  } = useAdvancedStudentSearch()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Advanced Student Search</CardTitle>
                <CardDescription>
                  Filter and locate students by academic year, grade, section, status, or keyword
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              disabled={students.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <StudentSearchFilters
            filters={searchFilters}
            setFilters={setSearchFilters}
            batches={batches}
            grades={grades}
            sections={sections}
            onSearch={() => executeSearch(1)}
            onReset={resetFilters}
            isLoading={isLoading}
          />

          <StudentSearchResultsTable
            students={students}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => executeSearch(page)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
