import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ClassItem, BatchItem, FeeStructureFormData } from './hooks/useFeeStructures'

interface FeeStructureFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  formData: FeeStructureFormData
  setFormData: React.Dispatch<React.SetStateAction<FeeStructureFormData>>
  onSubmit: (e: React.FormEvent) => void
  classes: ClassItem[]
  batches: BatchItem[]
  loading: boolean
}

const feeFrequencies = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMESTERLY', label: 'Semesterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ONE_TIME', label: 'One Time' },
]

const feeCategories = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'TRANSPORT', label: 'Transport Fee' },
  { value: 'LIBRARY', label: 'Library Fee' },
  { value: 'LABORATORY', label: 'Laboratory Fee' },
  { value: 'SPORTS', label: 'Sports Fee' },
  { value: 'EXAMINATION', label: 'Examination Fee' },
  { value: 'DEVELOPMENT', label: 'Development Fee' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
]

export const FeeStructureForm: React.FC<FeeStructureFormProps> = ({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  onSubmit,
  classes,
  batches,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Fee Structure' : 'Create New Fee Structure'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the fee configuration and applicable grades'
              : 'Define a new recurring or one-time fee policy for classes and batches'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Grade 10 Tuition Fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="e.g. 5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feeCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Billing Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(val) => setFormData(prev => ({ ...prev, frequency: val }))}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feeFrequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Applicable Class</Label>
              <Select
                value={formData.classId}
                onValueChange={(val) => setFormData(prev => ({ ...prev, classId: val }))}
              >
                <SelectTrigger id="classId">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchId">Applicable Batch</Label>
              <Select
                value={formData.batchId}
                onValueChange={(val) => setFormData(prev => ({ ...prev, batchId: val }))}
              >
                <SelectTrigger id="batchId">
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batchName} ({b.batchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Fee breakdown details..."
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isMandatory">Mandatory Fee</Label>
              <p className="text-xs text-muted-foreground">Applies automatically to all students</p>
            </div>
            <Switch
              id="isMandatory"
              checked={formData.isMandatory}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMandatory: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Fee' : 'Create Fee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
