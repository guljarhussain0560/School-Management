'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, Plus, Search } from 'lucide-react'
import { useStudents, Student } from './hooks/useStudents'
import { StudentForm } from './StudentForm'
import { StudentTable } from './StudentTable'

export const StudentManagement: React.FC = () => {
  const {
    students,
    classes,
    batches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    selectedStudent,
    setSelectedStudent,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents()

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Student Directory
          </h2>
          <p className="text-muted-foreground">
            Manage student registrations, academic placements, classes, and contact records.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Search student roster by name, email, or student ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <StudentTable
        students={students}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteStudent}
      />

      {showCreateDialog && (
        <StudentForm
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={createStudent}
          classes={classes}
          batches={batches}
          title="Enroll New Student"
        />
      )}

      {showEditDialog && selectedStudent && (
        <StudentForm
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setSelectedStudent(null)
          }}
          onSubmit={(data) => updateStudent(selectedStudent.id, data)}
          initialData={selectedStudent}
          classes={classes}
          batches={batches}
          title="Edit Student Information"
        />
      )}
    </div>
  )
}

export default StudentManagement