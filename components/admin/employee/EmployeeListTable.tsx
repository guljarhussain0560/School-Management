'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, UserPlus } from 'lucide-react'
import { Employee } from './types'

interface EmployeeListTableProps {
  employees: Employee[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  totalCount: number
  search: string
  field: string
  department: string
  status: string
  onSearchChange: (val: string) => void
  onFieldChange: (val: string) => void
  onDeptChange: (val: string) => void
  onStatusChange: (val: string) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
  onAddEmployee: () => void
  onView: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (id: string) => void
}

export function EmployeeListTable({
  employees,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  search,
  field,
  department,
  status,
  onSearchChange,
  onFieldChange,
  onDeptChange,
  onStatusChange,
  onPageChange,
  onRefresh,
  onAddEmployee,
  onView,
  onEdit,
  onDelete,
}: EmployeeListTableProps) {
  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>
      case 'ON_LEAVE':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-300">On Leave</Badge>
      case 'TERMINATED':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-300">Terminated</Badge>
      default:
        return <Badge variant="outline">{stat}</Badge>
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Faculty & Staff Directory</CardTitle>
            <CardDescription>Comprehensive register of institutional personnel, roles, and compensation ({totalCount} entries)</CardDescription>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={onAddEmployee}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-2 border-t">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={field} onValueChange={onFieldChange}>
            <SelectTrigger>
              <SelectValue placeholder="Search Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="employeeId">Employee ID</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={onDeptChange}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Teaching">Teaching</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Dept & Role</th>
                <th className="px-4 py-3">Monthly Salary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">Loading employee roster...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">No employees found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{emp.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.position}</div>
                      <div className="text-xs text-muted-foreground">{emp.department}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{Number(emp.salary).toLocaleString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onView(emp)} className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(emp)} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(emp.id)} className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
            Showing Page {currentPage} of {totalPages} ({totalCount} total staff)
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
