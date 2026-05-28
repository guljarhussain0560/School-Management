'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Employee, EmployeeSummary, EmployeeFormData } from '../types'

export const initialEmployeeForm: EmployeeFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  dateOfJoining: new Date().toISOString().split('T')[0],
  department: 'Teaching',
  position: '',
  salary: '',
  status: 'ACTIVE',
  emergencyContact: '',
  emergencyPhone: '',
  qualifications: '',
  experience: '',
  bankAccount: '',
  ifscCode: '',
  panNumber: '',
  aadharNumber: '',
  notes: '',
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [summary, setSummary] = useState<EmployeeSummary>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    onLeaveEmployees: 0,
    totalSalary: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [field, setField] = useState('name')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  const [formData, setFormData] = useState<EmployeeFormData>(initialEmployeeForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/employee', window.location.origin)
      url.searchParams.set('page', currentPage.toString())
      url.searchParams.set('limit', '10')
      if (search) {
        url.searchParams.set('search', search)
        url.searchParams.set('field', field)
      }
      if (department !== 'all') url.searchParams.set('department', department)
      if (status !== 'all') url.searchParams.set('status', status)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || 0)

        const emps: Employee[] = data.employees || []
        setSummary({
          totalEmployees: emps.length,
          activeEmployees: emps.filter(e => e.status === 'ACTIVE').length,
          inactiveEmployees: emps.filter(e => e.status === 'INACTIVE').length,
          onLeaveEmployees: emps.filter(e => e.status === 'ON_LEAVE').length,
          totalSalary: emps.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0),
        })
      }
    } catch {
      toast.error('Failed to load employee roster')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search, field, department, status])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleFormChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.salary) {
      toast.error('Please fill in all mandatory employee fields')
      return
    }

    setIsSubmitting(true)
    try {
      const isEdit = !!editingEmployee
      const url = isEdit ? `/api/employee/${editingEmployee.id}` : '/api/employee'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary) || 0,
        }),
      })

      if (res.ok) {
        toast.success(`Employee ${isEdit ? 'updated' : 'registered'} successfully`)
        setIsDialogOpen(false)
        setEditingEmployee(null)
        setFormData(initialEmployeeForm)
        fetchEmployees()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save employee profile')
      }
    } catch {
      toast.error('Network error occurred while saving employee')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    try {
      const res = await fetch(`/api/employee/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Employee deleted')
        fetchEmployees()
      } else {
        toast.error('Failed to delete employee')
      }
    } catch {
      toast.error('Network error during employee deletion')
    }
  }

  const openCreateDialog = () => {
    setEditingEmployee(null)
    setFormData(initialEmployeeForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
      department: employee.department,
      position: employee.position,
      salary: String(employee.salary),
      status: employee.status,
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      qualifications: employee.qualifications || '',
      experience: employee.experience || '',
      bankAccount: employee.bankAccount || '',
      ifscCode: employee.ifscCode || '',
      panNumber: employee.panNumber || '',
      aadharNumber: employee.aadharNumber || '',
      notes: employee.notes || '',
    })
    setIsDialogOpen(true)
  }

  return {
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
  }
}
