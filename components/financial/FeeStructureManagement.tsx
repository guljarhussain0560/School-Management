'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search } from 'lucide-react'
import { useFeeStructures } from './hooks/useFeeStructures'
import { FeeStructureForm } from './FeeStructureForm'
import { FeeStructureTable } from './FeeStructureTable'

export default function FeeStructureManagement() {
  const {
    feeStructures,
    classes,
    batches,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingFee,
    formData,
    setFormData,
    resetForm,
    handleCreateFeeStructure,
    handleUpdateFeeStructure,
    handleDeleteFeeStructure,
    openEditDialog,
  } = useFeeStructures()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Structure Management</h1>
          <p className="text-muted-foreground">
            Configure tuition, transport, library, and examination fees across grades.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsCreateDialogOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Fee Structure
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <CardTitle>Fee Schedules</CardTitle>
              <CardDescription>
                Browse active fee rates, billing frequencies, and assignments
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fee code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="TUITION">Tuition</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="LIBRARY">Library</SelectItem>
                  <SelectItem value="EXAMINATION">Examination</SelectItem>
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FeeStructureTable
            feeStructures={feeStructures}
            loading={loading}
            onEdit={(fee) => {
              openEditDialog(fee)
              setIsCreateDialogOpen(true)
            }}
            onDelete={handleDeleteFeeStructure}
          />
        </CardContent>
      </Card>

      <FeeStructureForm
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isEditing={!!editingFee}
        formData={formData}
        setFormData={setFormData}
        onSubmit={editingFee ? handleUpdateFeeStructure : handleCreateFeeStructure}
        classes={classes}
        batches={batches}
        loading={loading}
      />
    </div>
  )
}
