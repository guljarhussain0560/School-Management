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
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  Users,
  BookOpen,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface FeeStructure {
  id: string
  feeCode: string
  name: string
  description?: string
  amount: number
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  applicableTo?: string
  class?: {
    id: string
    className: string
    classCode: string
  }
  batch?: {
    id: string
    batchName: string
    batchCode: string
  }
  creator: {
    id: string
    name: string
    email: string
  }
  _count: {
    collections: number
  }
  createdAt: string
  updatedAt: string
}

interface Class {
  id: string
  className: string
  classCode: string
}

interface Batch {
  id: string
  batchName: string
  batchCode: string
}

interface FeeStructureFormData {
  name: string
  description: string
  amount: string
  frequency: string
  category: string
  isMandatory: boolean
  isActive: boolean
  applicableFrom: string
  applicableTo: string
  classId: string
  batchId: string
}

export default function FeeStructureManagement() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const [formData, setFormData] = useState<FeeStructureFormData>({
    name: '',
    description: '',
    amount: '',
    frequency: 'MONTHLY',
    category: 'TUITION',
    isMandatory: true,
    isActive: true,
    applicableFrom: new Date().toISOString().split('T')[0],
    applicableTo: '',
    classId: '',
    batchId: ''
  })

  const feeFrequencies = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'SEMESTERLY', label: 'Semesterly' },
    { value: 'ANNUAL', label: 'Annual' },
    { value: 'ONE_TIME', label: 'One Time' }
  ]

  const feeCategories = [
    { value: 'TUITION', label: 'Tuition Fee' },
    { value: 'TRANSPORT', label: 'Transport Fee' },
    { value: 'LIBRARY', label: 'Library Fee' },
    { value: 'LABORATORY', label: 'Laboratory Fee' },
    { value: 'SPORTS', label: 'Sports Fee' },
    { value: 'EXAMINATION', label: 'Examination Fee' },
    { value: 'DEVELOPMENT', label: 'Development Fee' },
    { value: 'MISCELLANEOUS', label: 'Miscellaneous' }
  ]

  useEffect(() => {
    fetchFeeStructures()
    fetchClasses()
    fetchBatches()
  }, [])

  const fetchFeeStructures = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financial/fee-structures')
      if (response.ok) {
        const data = await response.json()
        setFeeStructures(data.feeStructures || [])
      } else {
        toast.error('Failed to fetch fee structures')
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error)
      toast.error('Error fetching fee structures')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/academic/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/academic/student-batches')
      if (response.ok) {
        const data = await response.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/financial/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Fee structure created successfully')
        resetForm()
        setIsCreateDialogOpen(false)
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create fee structure')
      }
    } catch (error) {
      console.error('Error creating fee structure:', error)
      toast.error('Error creating fee structure')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFee) return

    setLoading(true)

    try {
      const response = await fetch('/api/financial/fee-structures', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFee.id,
          ...formData
        })
      })

      if (response.ok) {
        toast.success('Fee structure updated successfully')
        resetForm()
        setEditingFee(null)
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update fee structure')
      }
    } catch (error) {
      console.error('Error updating fee structure:', error)
      toast.error('Error updating fee structure')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFeeStructure = async (feeStructureId: string) => {
    try {
      const response = await fetch(`/api/financial/fee-structures?id=${feeStructureId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Fee structure deleted successfully')
        fetchFeeStructures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete fee structure')
      }
    } catch (error) {
      console.error('Error deleting fee structure:', error)
      toast.error('Error deleting fee structure')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      frequency: 'MONTHLY',
      category: 'TUITION',
      isMandatory: true,
      isActive: true,
      applicableFrom: new Date().toISOString().split('T')[0],
      applicableTo: '',
      classId: '',
      batchId: ''
    })
  }

  const handleEdit = (feeStructure: FeeStructure) => {
    setEditingFee(feeStructure)
    setFormData({
      name: feeStructure.name,
      description: feeStructure.description || '',
      amount: feeStructure.amount.toString(),
      frequency: feeStructure.frequency,
      category: feeStructure.category,
      isMandatory: feeStructure.isMandatory,
      isActive: feeStructure.isActive,
      applicableFrom: feeStructure.applicableFrom.split('T')[0],
      applicableTo: feeStructure.applicableTo ? feeStructure.applicableTo.split('T')[0] : '',
      classId: feeStructure.class?.id || '',
      batchId: feeStructure.batch?.id || ''
    })
  }

  const filteredFeeStructures = feeStructures.filter(fee => {
    const matchesSearch = fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.feeCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || fee.category === categoryFilter
    const matchesClass = classFilter === 'all' || fee.class?.id === classFilter

    return matchesSearch && matchesCategory && matchesClass
  })

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'TUITION': return 'default'
      case 'TRANSPORT': return 'secondary'
      case 'LIBRARY': return 'outline'
      case 'LABORATORY': return 'destructive'
      default: return 'outline'
    }
  }

  const getFrequencyBadgeVariant = (frequency: string) => {
    switch (frequency) {
      case 'MONTHLY': return 'default'
      case 'QUARTERLY': return 'secondary'
      case 'ANNUAL': return 'outline'
      default: return 'outline'
    }
  }

  if (loading && feeStructures.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Structure Management
            </CardTitle>
            <CardDescription>
              Create and manage fee structures for different classes and categories
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Fee Structure</DialogTitle>
                <DialogDescription>
                  Define a new fee structure for students.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFeeStructure} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Fee Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Tuition Fee, Transport Fee"
                      required
                    />
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
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeFrequencies.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classId">Applicable Class</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Classes</SelectItem>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="batchId">Applicable Batch</Label>
                    <Select
                      value={formData.batchId}
                      onValueChange={(value) => setFormData({ ...formData, batchId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Batches</SelectItem>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="applicableFrom">Applicable From *</Label>
                    <Input
                      id="applicableFrom"
                      type="date"
                      value={formData.applicableFrom}
                      onChange={(e) => setFormData({ ...formData, applicableFrom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="applicableTo">Applicable To</Label>
                    <Input
                      id="applicableTo"
                      type="date"
                      value={formData.applicableTo}
                      onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description of the fee"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isMandatory"
                      checked={formData.isMandatory}
                      onCheckedChange={(checked) => setFormData({ ...formData, isMandatory: checked })}
                    />
                    <Label htmlFor="isMandatory">Mandatory Fee</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Create Fee Structure
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
                placeholder="Search fee structures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {feeCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fee Structures Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeeStructures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No fee structures found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeeStructures.map((feeStructure) => (
                  <TableRow key={feeStructure.id}>
                    <TableCell className="font-mono text-sm">
                      {feeStructure.feeCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {feeStructure.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryBadgeVariant(feeStructure.category)}>
                        {feeCategories.find(c => c.value === feeStructure.category)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ₹{feeStructure.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getFrequencyBadgeVariant(feeStructure.frequency)}>
                        {feeFrequencies.find(f => f.value === feeStructure.frequency)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {feeStructure.class ? (
                        <div className="text-sm">
                          <div className="font-medium">{feeStructure.class.className}</div>
                          {feeStructure.batch && (
                            <div className="text-muted-foreground">{feeStructure.batch.batchName}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">All Classes</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {feeStructure._count.collections} collections
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={feeStructure.isActive ? "default" : "secondary"}>
                        {feeStructure.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(feeStructure)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{feeStructure.name}"? This action cannot be undone.
                                {feeStructure._count.collections > 0 && (
                                  <span className="block mt-2 text-red-600">
                                    This fee structure has {feeStructure._count.collections} collections and cannot be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFeeStructure(feeStructure.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={feeStructure._count.collections > 0}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      {editingFee && (
        <Dialog open={!!editingFee} onOpenChange={() => setEditingFee(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Fee Structure</DialogTitle>
              <DialogDescription>
                Update the fee structure details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateFeeStructure} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Fee Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feeCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-frequency">Frequency *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feeFrequencies.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isMandatory"
                    checked={formData.isMandatory}
                    onCheckedChange={(checked) => setFormData({ ...formData, isMandatory: checked })}
                  />
                  <Label htmlFor="edit-isMandatory">Mandatory Fee</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingFee(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Update Fee Structure
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
