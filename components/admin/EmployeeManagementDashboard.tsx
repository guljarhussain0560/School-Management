'use client'

import React from 'react'
import { useEmployees } from './employee/hooks/useEmployees'
import { EmployeeOverviewCards } from './employee/EmployeeOverviewCards'
import { EmployeeListTable } from './employee/EmployeeListTable'
import { EmployeeFormDialog } from './employee/EmployeeFormDialog'
import { EmployeeDetailsModal } from './employee/EmployeeDetailsModal'

interface EmployeeManagementDashboardProps {
  activeSubSection: string
  setActiveSubSection: (section: string) => void
}

export default function EmployeeManagementDashboard({
  activeSubSection,
  setActiveSubSection,
}: EmployeeManagementDashboardProps) {
  const {
    employees,
    summary,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    search,
    setSearch,
    field,
    setField,
    department,
    setDepartment,
    status,
    setStatus,
    isDialogOpen,
    setIsDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedEmployee,
    setSelectedEmployee,
    editingEmployee,
    formData,
    isSubmitting,
    handleFormChange,
    handleCreateOrUpdate,
    handleDelete,
    openCreateDialog,
    openEditDialog,
    fetchEmployees,
  } = useEmployees()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Faculty & Human Resources Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Oversee staff rosters, departmental allocations, credential assignments, and payroll compensation.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <EmployeeOverviewCards summary={summary} />

      {/* Employee List Table */}
      <EmployeeListTable
        employees={employees}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        field={field}
        department={department}
        status={status}
        onSearchChange={setSearch}
        onFieldChange={setField}
        onDeptChange={setDepartment}
        onStatusChange={setStatus}
        onPageChange={setCurrentPage}
        onRefresh={fetchEmployees}
        onAddEmployee={openCreateDialog}
        onView={emp => {
          setSelectedEmployee(emp)
          setIsViewDialogOpen(true)
        }}
        onEdit={openEditDialog}
        onDelete={handleDelete}
      />

      {/* Create / Edit Form Modal */}
      <EmployeeFormDialog
        isOpen={isDialogOpen}
        isEditing={!!editingEmployee}
        formData={formData}
        isSubmitting={isSubmitting}
        onChange={handleFormChange}
        onSubmit={handleCreateOrUpdate}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* View Employee Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false)
          setSelectedEmployee(null)
        }}
      />
    </div>
  )
}
