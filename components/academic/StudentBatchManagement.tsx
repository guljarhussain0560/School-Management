'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search } from 'lucide-react'
import { useStudentBatches } from './hooks/useStudentBatches'
import { StudentBatchForm } from './StudentBatchForm'
import { StudentBatchTable } from './StudentBatchTable'

export default function StudentBatchManagement() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Batch Management</h1>
          <p className="text-muted-foreground">
            Configure student academic cohorts, enrollment years, and promotion schedules.
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
          Add Batch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Academic Batches</CardTitle>
              <CardDescription>
                Overview of enrolled cohorts, active timelines, and student count
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search batch code or year..."
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
