'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  FileText,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  RefreshCw,
  Shield,
  Calculator,
  FileSpreadsheet
} from 'lucide-react'

interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  dateOfJoining: string
  department: string
  position: string
  salary: number
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'
  emergencyContact?: string
  emergencyPhone?: string
  qualifications?: string
  experience?: string
  bankAccount?: string
  ifscCode?: string
  panNumber?: string
  aadharNumber?: string
  notes?: string
  creator?: {
    name: string
  }
}

interface EmployeeSummary {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  onLeaveEmployees: number
  totalSalary: number
}

interface EmployeeManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function EmployeeManagementDashboard({ activeSubSection, setActiveSubSection }: EmployeeManagementDashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [summary, setSummary] = useState<EmployeeSummary>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    onLeaveEmployees: 0,
    totalSalary: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(50) // Increased from 10 to 50
  const [search, setSearch] = useState('')
  const [field, setField] = useState('name')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadFilters, setDownloadFilters] = useState({
    department: 'all',
    status: 'all',
    format: 'csv'
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    department: '',
    position: '',
    salary: '',
    emergencyContact: '',
    emergencyPhone: '',
    qualifications: '',
    experience: '',
    bankAccount: '',
    ifscCode: '',
    panNumber: '',
    aadharNumber: '',
    notes: ''
  })

  const departments = [
    'Administration',
    'Teaching',
    'Support Staff',
    'Transport',
    'Security',
    'Maintenance',
    'IT',
    'Finance',
    'HR'
  ]

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    TERMINATED: 'bg-red-100 text-red-800',
    ON_LEAVE: 'bg-yellow-100 text-yellow-800'
  }

  useEffect(() => {
    fetchEmployees()
  }, [currentPage, itemsPerPage, search, field, department, status])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: search,
        field: field,
        department: department,
        status: status
      })
      
      const response = await fetch(`/api/employee?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || 0)
        setCurrentPage(data.pagination?.currentPage || currentPage)
        
        if (data.summary) {
          setSummary({
            totalEmployees: data.summary.totalEmployees || 0,
            activeEmployees: data.summary.activeEmployees || 0,
            inactiveEmployees: data.summary.inactiveEmployees || 0,
            onLeaveEmployees: data.summary.onLeaveEmployees || 0,
            totalSalary: data.summary.totalSalary || 0
          })
        }
      } else {
        console.error('API Error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to fetch employees')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Employee registered successfully!')
        setIsDialogOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          department: '',
          position: '',
          salary: '',
          emergencyContact: '',
          emergencyPhone: '',
          qualifications: '',
          experience: '',
          bankAccount: '',
          ifscCode: '',
          panNumber: '',
          aadharNumber: '',
          notes: ''
        })
        
        // Update summary for new employee
        if (data.employee) {
          updateSummaryForNewEmployee(data.employee)
          
          // Add new employee to the local state
          setEmployees(prevEmployees => [data.employee, ...prevEmployees])
        }
        
        // Refresh the employee list to get the latest data
        fetchEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to register employee')
      }
    } catch (error) {
      console.error('Error registering employee:', error)
      toast.error('Failed to register employee')
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEmployees()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const handleDownloadEmployees = async () => {
    setIsDownloading(true)
    try {
      // Build query parameters for filtered download
      const params = new URLSearchParams({
        department: downloadFilters.department,
        status: downloadFilters.status,
        format: downloadFilters.format,
        download: 'true'
      })

      const response = await fetch(`/api/employee/download?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Generate filename with filters
        const departmentText = downloadFilters.department === 'all' ? 'All' : downloadFilters.department
        const statusText = downloadFilters.status === 'all' ? 'All' : downloadFilters.status
        const timestamp = new Date().toISOString().split('T')[0]
        
        a.download = `employees_${departmentText}_${statusText}_${timestamp}.${downloadFilters.format}`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast.success('Employee list downloaded successfully!')
        setIsDownloadDialogOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to download employee list')
      }
    } catch (error) {
      console.error('Error downloading employees:', error)
      toast.error('Failed to download employee list')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFixSchoolIds = async () => {
    try {
      const response = await fetch('/api/employee/fix-school-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        // Refresh the employee list
        fetchEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to fix school IDs')
      }
    } catch (error) {
      console.error('Error fixing school IDs:', error)
      toast.error('Failed to fix school IDs')
    }
  }

  const updateSummaryStats = (updatedEmployee: any, newStatus: string) => {
    setSummary(prevSummary => {
      const newSummary = { ...prevSummary }
      
      // Find the employee being updated to get their previous status and salary
      const currentEmployee = employees.find(emp => 
        emp.id === updatedEmployee.id || emp.employeeId === updatedEmployee.employeeId
      )
      
      if (currentEmployee) {
        const oldStatus = currentEmployee.status
        const salary = currentEmployee.salary
        
        // Update counts based on status change
        // Remove from old status
        if (oldStatus === 'ACTIVE') {
          newSummary.activeEmployees = Math.max(0, newSummary.activeEmployees - 1)
          newSummary.totalSalary = Math.max(0, newSummary.totalSalary - salary)
        } else if (oldStatus === 'INACTIVE') {
          newSummary.inactiveEmployees = Math.max(0, newSummary.inactiveEmployees - 1)
        } else if (oldStatus === 'ON_LEAVE') {
          newSummary.onLeaveEmployees = Math.max(0, newSummary.onLeaveEmployees - 1)
        }
        
        // Add to new status
        if (newStatus === 'ACTIVE') {
          newSummary.activeEmployees = newSummary.activeEmployees + 1
          newSummary.totalSalary = newSummary.totalSalary + salary
        } else if (newStatus === 'INACTIVE') {
          newSummary.inactiveEmployees = newSummary.inactiveEmployees + 1
        } else if (newStatus === 'ON_LEAVE') {
          newSummary.onLeaveEmployees = newSummary.onLeaveEmployees + 1
        }
      }
      
      return newSummary
    })
  }

  const updateSummaryForNewEmployee = (newEmployee: any) => {
    setSummary(prevSummary => {
      const newSummary = { ...prevSummary }
      
      // Increment total employees
      newSummary.totalEmployees = newSummary.totalEmployees + 1
      
      // Add to appropriate status count (new employees are typically ACTIVE)
      const status = newEmployee.status || 'ACTIVE'
      if (status === 'ACTIVE') {
        newSummary.activeEmployees = newSummary.activeEmployees + 1
        newSummary.totalSalary = newSummary.totalSalary + (newEmployee.salary || 0)
      } else if (status === 'INACTIVE') {
        newSummary.inactiveEmployees = newSummary.inactiveEmployees + 1
      } else if (status === 'ON_LEAVE') {
        newSummary.onLeaveEmployees = newSummary.onLeaveEmployees + 1
      }
      
      return newSummary
    })
  }

  const fetchSummaryOnly = async () => {
    try {
      const response = await fetch('/api/employee/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleStatusChange = async (employeeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/employee/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const result = await response.json()
        const updatedEmployee = result.employee
        
        // Update only the specific employee in the local state
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.id === updatedEmployee.id || emp.employeeId === updatedEmployee.employeeId
              ? { ...emp, status: newStatus as "ACTIVE" | "INACTIVE" | "TERMINATED" | "ON_LEAVE" }
              : emp
          )
        )
        
        // Update summary statistics only
        updateSummaryStats(updatedEmployee, newStatus)
        
        toast.success(`Employee status updated to ${newStatus}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update employee status')
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      toast.error('Failed to update employee status')
    }
  }

  const downloadEmployeeList = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Status', 'Date of Joining'],
      ...employees.map(emp => [
        emp.employeeId,
        emp.name,
        emp.email,
        emp.phone || '',
        emp.department,
        emp.position,
        emp.salary.toString(),
        emp.status,
        new Date(emp.dateOfJoining).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderContent = () => {
    switch (activeSubSection) {
      case 'employee-management':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Employee Management</h1>
                <p className="text-gray-600">Manage school employees and staff</p>
              </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDownloadDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download List
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Register Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!formData.name || !formData.email || !formData.department || !formData.position || !formData.salary}
                  >
                    Register Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Employee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold">{summary.activeEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Employees</p>
                <p className="text-2xl font-bold">{summary.inactiveEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold">{summary.onLeaveEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Salary</p>
                <p className="text-2xl font-bold">₹{summary.totalSalary.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="searchField">Search Field</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="employeeId">Employee ID</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="searchTerm">Search Term</Label>
              <Input
                id="searchTerm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter search term"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage">Show:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="999999">All</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">per page</span>
            </div>
            
            {totalCount > 0 && (
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} employees
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading employees...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                  <p className="text-gray-500 mb-4">
                    {search || department !== 'all' || status !== 'all' 
                      ? 'Try adjusting your search criteria or filters'
                      : 'Get started by adding your first employee'
                    }
                  </p>
                  {!search && department === 'all' && status === 'all' && (
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Employee
                    </Button>
                  )}
                </div>
              ) : (
                employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <Badge 
                            variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              employee.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                              employee.status === 'TERMINATED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">ID: {employee.employeeId}</p>
                        <p className="text-sm text-gray-600 mb-1">{employee.department} • {employee.position}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>₹{employee.salary.toLocaleString()}</span>
                          <span>•</span>
                          <span>Joined: {new Date(employee.dateOfJoining).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Select 
                        value={employee.status} 
                        onValueChange={(value) => handleStatusChange(employee.id, value)}
                      >
                        <SelectTrigger className="w-36 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="TERMINATED">Terminated</SelectItem>
                          <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} • {totalCount} total employees
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                  {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

          </div>
        );

      case 'user-management':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600">Manage system users and access permissions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    System Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Manage system user accounts and roles</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    Role Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Define and manage user roles and permissions</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Access Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">View system access and activity logs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'payroll-integration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payroll Integration</h2>
              <p className="text-gray-600">Integrate with payroll systems and manage salary processing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Salary Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Process employee salaries and benefits</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Payroll Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Manage payroll schedules and deadlines</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Payroll Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Generate payroll and tax reports</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'employee-reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Reports</h2>
              <p className="text-gray-600">Generate comprehensive employee reports and analytics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Employee Directory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Complete employee contact and information directory</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    Department Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Employees grouped by department and position</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Salary Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Salary and compensation analysis</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Attendance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Employee attendance and leave reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Employee performance and evaluation reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-indigo-600" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Export employee data in various formats</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'employee-management', name: 'Employee Records', icon: Users },
            { id: 'user-management', name: 'User Management', icon: Shield },
            { id: 'payroll-integration', name: 'Payroll Integration', icon: Calculator },
            { id: 'employee-reports', name: 'Employee Reports', icon: FileSpreadsheet }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeSubSection === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Render Content */}
      {renderContent()}

      {/* Download Employee List Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Employee List
            </DialogTitle>
            <DialogDescription>
              Choose filters and format for downloading employee data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Department Filter */}
            <div>
              <Label htmlFor="downloadDepartment">Department</Label>
              <Select 
                value={downloadFilters.department} 
                onValueChange={(value) => setDownloadFilters({...downloadFilters, department: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="downloadStatus">Status</Label>
              <Select 
                value={downloadFilters.status} 
                onValueChange={(value) => setDownloadFilters({...downloadFilters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format Selection */}
            <div>
              <Label htmlFor="downloadFormat">Format</Label>
              <Select 
                value={downloadFilters.format} 
                onValueChange={(value) => setDownloadFilters({...downloadFilters, format: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Download Preview:</strong><br />
                Department: {downloadFilters.department === 'all' ? 'All' : downloadFilters.department}<br />
                Status: {downloadFilters.status === 'all' ? 'All' : downloadFilters.status}<br />
                Format: {downloadFilters.format.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDownloadDialogOpen(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDownloadEmployees}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-lg font-semibold">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                      <p className="text-lg font-mono">{selectedEmployee.employeeId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-sm">{selectedEmployee.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <p className="text-sm">{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Joining</Label>
                      <p className="text-sm">{new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Department</Label>
                      <p className="text-sm font-medium">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Position</Label>
                      <p className="text-sm font-medium">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Salary</Label>
                      <p className="text-lg font-semibold text-green-600">₹{selectedEmployee.salary.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge 
                        variant={selectedEmployee.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={`${
                          selectedEmployee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          selectedEmployee.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          selectedEmployee.status === 'TERMINATED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedEmployee.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Emergency Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact & Emergency Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="text-sm">{selectedEmployee.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                      <p className="text-sm">{selectedEmployee.emergencyContact || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Emergency Phone</Label>
                      <p className="text-sm">{selectedEmployee.emergencyPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Qualifications & Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Qualifications & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Qualifications</Label>
                      <p className="text-sm">{selectedEmployee.qualifications || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Experience</Label>
                      <p className="text-sm">{selectedEmployee.experience || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Bank Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bank Account</Label>
                      <p className="text-sm font-mono">{selectedEmployee.bankAccount || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">IFSC Code</Label>
                      <p className="text-sm font-mono">{selectedEmployee.ifscCode || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">PAN Number</Label>
                      <p className="text-sm font-mono">{selectedEmployee.panNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Aadhar Number</Label>
                      <p className="text-sm font-mono">{selectedEmployee.aadharNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedEmployee.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{selectedEmployee.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
