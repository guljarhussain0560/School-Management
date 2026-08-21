'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, BookOpen } from 'lucide-react'
import { useExamManagement } from './hooks/useExamManagement'
import { ExamListTable } from './exam/ExamListTable'
import { CreateExamDialog } from './exam/CreateExamDialog'

const ExamManagement: React.FC = () => {
  const {
    filteredExams,
    subjects,
    classes,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterClass,
    setFilterClass,
    handleCreateExam,
    handleDeleteExam,
  } = useExamManagement()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Exam Management</CardTitle>
                <CardDescription>
                  Create, schedule, and manage student assessments, terms, and evaluations
                </CardDescription>
              </div>
            </div>
            <CreateExamDialog
              subjects={subjects}
              classes={classes}
              onSubmit={handleCreateExam}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams by name, subject, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MIDTERM">Midterm</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ExamListTable
            exams={filteredExams}
            loading={loading}
            onDelete={handleDeleteExam}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ExamManagement
