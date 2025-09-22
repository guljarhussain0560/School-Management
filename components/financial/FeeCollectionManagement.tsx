'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  Receipt,
  TrendingUp,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface FeeCollection {
  id: string
  feeId: string
  studentId: string
  feeStructureId?: string
  amount: number
  paymentMode: string
  collectedBy: string
  date: string
  dueDate?: string
  receiptUrl?: string
  notes?: string
  status: string
  student: {
    id: string
    name: string
    studentId: string
    class: {
      className: string
      classCode: string
    }
  }
  feeStructure?: {
    id: string
    name: string
    feeCode: string
    category: string
  }
  collector: {
    id: string
    name: string
    email: string
  }
}

interface Student {
  id: string
  name: string
  studentId: string
  class: {
    className: string
    classCode: string
  }
}

interface FeeStructure {
  id: string
  name: string
  feeCode: string
  category: string
  amount: number
}

interface FeeCollectionFormData {
  studentId: string
  feeStructureId: string
  amount: string
  paymentMode: string
  dueDate: string
  notes: string
}

export default function FeeCollectionManagement() {
  const [feeCollections, setFeeCollections] = useState<FeeCollection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<FeeCollection | null>(null)
  const [formData, setFormData] = useState<FeeCollectionFormData>({
    studentId: '',
    feeStructureId: '',
    amount: '',
    paymentMode: 'CASH',
    dueDate: '',
    notes: ''
  })

  const paymentModes = [
    { value: 'CASH', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
  ]

  const statusOptions = [
    { value: 'PAID', label: 'Paid' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'WAIVED', label: 'Waived' }
  ]

  useEffect(() => {
    fetchFeeCollections()
    fetchStudents()
    fetchFeeStructures()
  }, [])

  const fetchFeeCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial/fee-collections')
      if (response.ok) {
        const data = await response.json()
        setFeeCollections(data.feeCollections || [])
      } else {
        toast.error('Failed to fetch fee collections')
      }
    } catch (error) {
      console.error('Error fetching fee collections:', error)
      toast.error('Error fetching fee collections')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/academic/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchFeeStructures = async () => {
    try {
      const response = await fetch('/api/financial/fee-structures')
      if (response.ok) {
        const data = await response.json()
        setFeeStructures(data.feeStructures || [])
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/financial/fee-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Fee collection recorded successfully')
        resetForm()
        setIsCreateDialogOpen(false)
        fetchFeeCollections()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to record fee collection')
      }
    } catch (error) {
      console.error('Error creating fee collection:', error)
      toast.error('Error creating fee collection')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeStructureId: '',
      amount: '',
      paymentMode: 'CASH',
      dueDate: '',
      notes: ''
    })
  }

  const handleStudentChange = (studentId: string) => {
    setFormData({ ...formData, studentId })
  }

  const handleFeeStructureChange = (feeStructureId: string) => {
    setFormData({ ...formData, feeStructureId })
    // Auto-fill amount
    const feeStructure = feeStructures.find(fs => fs.id === feeStructureId)
    if (feeStructure) {
      setFormData(prev => ({ ...prev, amount: feeStructure.amount.toString() }))
    }
  }

  const filteredCollections = feeCollections.filter(collection => {
    const matchesSearch = collection.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.feeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>
      case 'PARTIAL':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>
      case 'WAIVED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Waived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return <Badge variant="outline">Cash</Badge>
      case 'UPI':
        return <Badge variant="secondary">UPI</Badge>
      case 'BANK_TRANSFER':
        return <Badge variant="outline">Bank Transfer</Badge>
      default:
        return <Badge variant="outline">{mode}</Badge>
    }
  }

  // Calculate summary statistics
  const totalCollected = feeCollections
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.amount, 0)
  
  const totalPending = feeCollections
    .filter(c => c.status === 'PENDING' || c.status === 'OVERDUE')
    .reduce((sum, c) => sum + c.amount, 0)

  if (loading && feeCollections.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-semibold">₹{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-semibold">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Collections</p>
                <p className="text-2xl font-semibold">{feeCollections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Fee Collections
              </CardTitle>
              <CardDescription>
                Record and manage student fee payments
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Fee Payment</DialogTitle>
                  <DialogDescription>
                    Record a new fee payment for a student.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student *</Label>
                      <Select
                        value={formData.studentId}
                        onValueChange={handleStudentChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.studentId}) - {student.class.className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="feeStructureId">Fee Structure</Label>
                      <Select
                        value={formData.feeStructureId}
                        onValueChange={handleFeeStructureChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee structure" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeStructures.map((feeStructure) => (
                            <SelectItem key={feeStructure.id} value={feeStructure.id}>
                              {feeStructure.name} - ₹{feeStructure.amount.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMode">Payment Mode *</Label>
                      <Select
                        value={formData.paymentMode}
                        onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentModes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes about the payment"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Record Payment
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collections Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collected By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No fee collections found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-mono text-sm">
                        {collection.feeId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{collection.student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {collection.student.studentId} - {collection.student.class.className}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {collection.feeStructure ? (
                          <div>
                            <div className="font-medium">{collection.feeStructure.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {collection.feeStructure.feeCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Custom Payment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        ₹{collection.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getPaymentModeBadge(collection.paymentMode)}
                      </TableCell>
                      <TableCell>
                        {new Date(collection.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(collection.status)}
                      </TableCell>
                      <TableCell>
                        {collection.collector.name}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
