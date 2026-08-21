'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search } from 'lucide-react'
import { useSections } from './hooks/useSections'
import { SectionForm } from './SectionForm'
import { SectionTable } from './SectionTable'

export default function SectionManagement() {
  const {
    grades,
    sections,
    loading,
    searchTerm,
    setSearchTerm,
    selectedGrade,
    setSelectedGrade,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingSection,
    formData,
    setFormData,
    resetForm,
    handleCreateSection,
    handleUpdateSection,
    handleDeleteSection,
    openEditDialog,
  } = useSections()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Section Management</h1>
          <p className="text-muted-foreground">
            Manage section divisions, class capacities, and grade assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Class Sections</CardTitle>
              <CardDescription>
                View all active sections, enrolled students, and room quotas
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.gradeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SectionTable
            sections={sections}
            loading={loading}
            onEdit={(section) => {
              openEditDialog(section)
              setIsCreateOpen(true)
            }}
            onDelete={handleDeleteSection}
          />
        </CardContent>
      </Card>

      <SectionForm
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isEditing={!!editingSection}
        formData={formData}
        setFormData={setFormData}
        onSubmit={editingSection ? handleUpdateSection : handleCreateSection}
        grades={grades}
        loading={loading}
      />
    </div>
  )
}
