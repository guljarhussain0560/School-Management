'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  FileText,
  BarChart3,
  Download,
  Upload,
  Eye,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface MaintenanceItem {
  id: string
  name: string
  description?: string
  status: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS'
  notes?: string
  photoUrl?: string
  lastChecked: string
  createdAt: string
  updatedAt: string
}

interface MaintenanceLog {
  id: string
  facility: string
  status: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS'
  notes?: string
  proofUrl?: string
  reportedBy: string
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    name: string
    email: string
  }
}

interface MaintenanceSummary {
  summary: {
    totalItems: number
    totalLogs: number
    itemsNeedingAttention: number
    logsNeedingAttention: number
    recentLogs: number
  }
  itemsByStatus: Array<{ status: string; _count: { status: number } }>
  logsByStatus: Array<{ status: string; _count: { status: number } }>
  facilityBreakdown: Array<{ facility: string; _count: { facility: number } }>
}

export default function MaintenanceManagement() {
  const [activeTab, setActiveTab] = useState<'items' | 'logs' | 'summary'>('items')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [summary, setSummary] = useState<MaintenanceSummary | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [facilityFilter, setFacilityFilter] = useState('all')

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null)
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null)

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    status: 'OK' as 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS',
    notes: ''
  })

  const [logForm, setLogForm] = useState({
    facility: '',
    status: 'OK' as 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS',
    notes: ''
  })

  // Fetch maintenance items
  const fetchItems = async (page = 1, search = '', status = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status })
      })

      const response = await fetch(`/api/operations/maintenance/items?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setTotalPages(data.pagination.pages)
        setTotalItems(data.pagination.total)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch maintenance items')
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Error fetching maintenance items')
    } finally {
      setLoading(false)
    }
  }

  // Fetch maintenance logs
  const fetchLogs = async (page = 1, search = '', status = 'all', facility = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(facility !== 'all' && { facility })
      })

      const response = await fetch(`/api/operations/maintenance/logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotalPages(data.pagination.pages)
        setTotalItems(data.pagination.total)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch maintenance logs')
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Error fetching maintenance logs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/operations/maintenance/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        toast.error('Failed to fetch maintenance summary')
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
      toast.error('Error fetching maintenance summary')
    }
  }

  // Handle item submission
  const handleItemSubmit = async () => {
    if (!itemForm.name.trim()) {
      toast.error('Item name is required')
      return
    }

    setLoading(true)
    try {
      const url = editingItem 
        ? `/api/operations/maintenance/items/${editingItem.id}`
        : '/api/operations/maintenance/items'
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemForm)
      })

      if (response.ok) {
        toast.success(editingItem ? 'Item updated successfully' : 'Item created successfully')
        setItemDialogOpen(false)
        setEditingItem(null)
        setItemForm({ name: '', description: '', status: 'OK', notes: '' })
        fetchItems(currentPage, searchTerm, statusFilter)
        fetchSummary()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save item')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Error saving maintenance item')
    } finally {
      setLoading(false)
    }
  }

  // Handle log submission
  const handleLogSubmit = async () => {
    if (!logForm.facility.trim()) {
      toast.error('Facility name is required')
      return
    }

    setLoading(true)
    try {
      const url = editingLog 
        ? `/api/operations/maintenance/logs/${editingLog.id}`
        : '/api/operations/maintenance/logs'
      
      const method = editingLog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logForm)
      })

      if (response.ok) {
        toast.success(editingLog ? 'Log updated successfully' : 'Log created successfully')
        setLogDialogOpen(false)
        setEditingLog(null)
        setLogForm({ facility: '', status: 'OK', notes: '' })
        fetchLogs(currentPage, searchTerm, statusFilter, facilityFilter)
        fetchSummary()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save log')
      }
    } catch (error) {
      console.error('Error saving log:', error)
      toast.error('Error saving maintenance log')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string, type: 'item' | 'log') => {
    if (!confirm('Are you sure you want to delete this record?')) return

    setLoading(true)
    try {
      const endpoint = type === 'item' 
        ? `/api/operations/maintenance/items/${id}`
        : `/api/operations/maintenance/logs/${id}`

      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Record deleted successfully')
        if (type === 'item') {
          fetchItems(currentPage, searchTerm, statusFilter)
        } else {
          fetchLogs(currentPage, searchTerm, statusFilter, facilityFilter)
        }
        fetchSummary()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete record')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Error deleting record')
    } finally {
      setLoading(false)
    }
  }

  // Open edit dialogs
  const openEditItem = (item: MaintenanceItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      status: item.status,
      notes: item.notes || ''
    })
    setItemDialogOpen(true)
  }

  const openEditLog = (log: MaintenanceLog) => {
    setEditingLog(log)
    setLogForm({
      facility: log.facility,
      status: log.status,
      notes: log.notes || ''
    })
    setLogDialogOpen(true)
  }

  // Close dialogs
  const closeItemDialog = () => {
    setItemDialogOpen(false)
    setEditingItem(null)
    setItemForm({ name: '', description: '', status: 'OK', notes: '' })
  }

  const closeLogDialog = () => {
    setLogDialogOpen(false)
    setEditingLog(null)
    setLogForm({ facility: '', status: 'OK', notes: '' })
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    if (activeTab === 'items') {
      fetchItems(1, searchTerm, statusFilter)
    } else if (activeTab === 'logs') {
      fetchLogs(1, searchTerm, statusFilter, facilityFilter)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (activeTab === 'items') {
      fetchItems(page, searchTerm, statusFilter)
    } else if (activeTab === 'logs') {
      fetchLogs(page, searchTerm, statusFilter, facilityFilter)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-800'
      case 'NEEDS_REPAIR':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4" />
      case 'NEEDS_REPAIR':
        return <AlertTriangle className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      default:
        return <Wrench className="h-4 w-4" />
    }
  }

  // Initial load
  useEffect(() => {
    fetchItems()
    fetchSummary()
  }, [])

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems(1, searchTerm, statusFilter)
    } else if (activeTab === 'logs') {
      fetchLogs(1, searchTerm, statusFilter, facilityFilter)
    } else if (activeTab === 'summary') {
      fetchSummary()
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600">Track and manage facility maintenance and repairs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setItemDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button
            onClick={() => setLogDialogOpen(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Log
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'items' | 'logs' | 'summary')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Maintenance Items</TabsTrigger>
          <TabsTrigger value="logs">Maintenance Logs</TabsTrigger>
          <TabsTrigger value="summary">Summary & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NEEDS_REPAIR">Needs Repair</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Items ({totalItems} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Checked</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.description || '-'}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(item.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(item.status)}
                                  {item.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(item.lastChecked).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {item.notes || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditItem(item)}
                                  title="Edit item"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id, 'item')}
                                  title="Delete item"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="log-search">Search</Label>
                  <Input
                    id="log-search"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="log-status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NEEDS_REPAIR">Needs Repair</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="facility-filter">Filter by Facility</Label>
                  <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All facilities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All facilities</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                      <SelectItem value="Playground">Playground</SelectItem>
                      <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Maintenance Logs ({totalItems} logs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Facility</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reported By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.facility}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(log.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(log.status)}
                                  {log.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{log.reporter.name}</p>
                                <p className="text-sm text-gray-500">{log.reporter.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(log.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.notes || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditLog(log)}
                                  title="Edit log"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(log.id, 'log')}
                                  title="Delete log"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.summary.totalItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Logs</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.summary.totalLogs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Items Needing Attention</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.summary.itemsNeedingAttention}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recent Logs (7 days)</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.summary.recentLogs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status Breakdown */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Items by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.itemsByStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.status.replace('_', ' ')}</span>
                        </div>
                        <Badge className={getStatusBadgeColor(item.status)}>
                          {item._count.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Logs by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.logsByStatus.map((log) => (
                      <div key={log.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-medium">{log.status.replace('_', ' ')}</span>
                        </div>
                        <Badge className={getStatusBadgeColor(log.status)}>
                          {log._count.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Facility Breakdown */}
          {summary && summary.facilityBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top Facilities by Maintenance Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.facilityBreakdown.map((facility, index) => (
                    <div key={facility.facility} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <span className="font-medium">{facility.facility}</span>
                      </div>
                      <Badge variant="outline">
                        {facility._count.facility} logs
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Maintenance Item' : 'Add Maintenance Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                value={itemForm.name}
                onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="item-status">Status *</Label>
              <Select value={itemForm.status} onValueChange={(value: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS') => setItemForm({...itemForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="NEEDS_REPAIR">Needs Repair</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-notes">Notes</Label>
              <Textarea
                id="item-notes"
                value={itemForm.notes}
                onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                placeholder="Enter maintenance notes"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleItemSubmit} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
              </Button>
              <Button 
                variant="outline" 
                onClick={closeItemDialog}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Maintenance Log' : 'Add Maintenance Log'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="log-facility">Facility *</Label>
              <Input
                id="log-facility"
                value={logForm.facility}
                onChange={(e) => setLogForm({...logForm, facility: e.target.value})}
                placeholder="Enter facility name"
              />
            </div>

            <div>
              <Label htmlFor="log-status">Status *</Label>
              <Select value={logForm.status} onValueChange={(value: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS') => setLogForm({...logForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="NEEDS_REPAIR">Needs Repair</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="log-notes">Notes</Label>
              <Textarea
                id="log-notes"
                value={logForm.notes}
                onChange={(e) => setLogForm({...logForm, notes: e.target.value})}
                placeholder="Enter maintenance notes"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleLogSubmit} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : (editingLog ? 'Update Log' : 'Create Log')}
              </Button>
              <Button 
                variant="outline" 
                onClick={closeLogDialog}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
