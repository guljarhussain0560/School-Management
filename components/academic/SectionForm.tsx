import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Grade, SectionFormData } from './hooks/useSections'

interface SectionFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  formData: SectionFormData
  setFormData: React.Dispatch<React.SetStateAction<SectionFormData>>
  onSubmit: (e: React.FormEvent) => void
  grades: Grade[]
  loading: boolean
}

export const SectionForm: React.FC<SectionFormProps> = ({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  onSubmit,
  grades,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Section' : 'Create New Section'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update section details and class capacity' : 'Add a section division to a specific grade level'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gradeId">Grade</Label>
            <Select
              value={formData.gradeId}
              onValueChange={(val) => setFormData(prev => ({ ...prev, gradeId: val }))}
            >
              <SelectTrigger id="gradeId">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.gradeName} ({grade.gradeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionName">Section Name</Label>
            <Input
              id="sectionName"
              value={formData.sectionName}
              onChange={(e) => setFormData(prev => ({ ...prev, sectionName: e.target.value }))}
              placeholder="e.g. Section A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Class Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              placeholder="e.g. 40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Room location or special notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
