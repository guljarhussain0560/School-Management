'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, GraduationCap, Users, Calendar } from 'lucide-react'
import { useStudentBatches } from './hooks/useStudentBatches'
import { StudentBatchForm } from './StudentBatchForm'
import { StudentBatchTable } from './StudentBatchTable'

interface BatchManagementProps {
  activeSubSection?: string
  setActiveSubSection?: (section: string) => void
}

export const BatchManagement: React.FC<BatchManagementProps> = () => {
  const {
    batches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingBatch,
    formData,
    setFormData,
    resetForm,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    openEditDialog,
  } = useStudentBatches()

  const totalStudents = batches.reduce((acc, b) => acc + (b._count?.students || 0), 0)
  const activeBatches = batches.filter(b => b.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch & Cohort Management</h1>
          <p className="text-muted-foreground">
            Manage academic batches, student assignments, and session timelines.
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
          Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">{activeBatches} active academic sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all batches and grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</div>
            <p className="text-xs text-muted-foreground">Current academic session</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Registered Batches</CardTitle>
              <CardDescription>
                Search and manage batch divisions and session details
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search batch name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentBatchTable
            batches={batches}
            loading={loading}
            onEdit={(batch) => {
              openEditDialog(batch)
              setIsCreateOpen(true)
            }}
            onDelete={handleDeleteBatch}
          />
        </CardContent>
      </Card>

      <StudentBatchForm
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isEditing={!!editingBatch}
        formData={formData}
        setFormData={setFormData}
        onSubmit={editingBatch ? handleUpdateBatch : handleCreateBatch}
        loading={loading}
      />
    </div>
  )
}

export default BatchManagement