'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GraduationCap, Award, Search, Plus } from 'lucide-react'
import { usePerformanceState } from '../hooks/usePerformanceState'

export default function StudentPerformanceSection() {
  const {
    performanceForm,
    handleFormChange,
    resetForm,
    handleSubmitPerformance,
    performances,
  } = usePerformanceState()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            Record Student Academic Performance & Marks
          </CardTitle>
          <CardDescription>Enter exam results, test scores, and qualitative teacher feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPerformance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Student ID *</Label>
                <Input
                  placeholder="e.g. STU-2026-001"
                  value={performanceForm.studentId}
                  onChange={(e) => handleFormChange('studentId', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Grade / Level *</Label>
                <Select
                  value={performanceForm.grade}
                  onValueChange={(val) => handleFormChange('grade', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  placeholder="e.g. Mathematics"
                  value={performanceForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select
                  value={performanceForm.examType}
                  onValueChange={(val) => handleFormChange('examType', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid-Term">Mid-Term Examination</SelectItem>
                    <SelectItem value="Final-Term">Final-Term Examination</SelectItem>
                    <SelectItem value="Monthly-Test">Monthly Unit Test</SelectItem>
                    <SelectItem value="Quiz">Class Quiz / Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marks Obtained *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 85"
                  value={performanceForm.marks}
                  onChange={(e) => handleFormChange('marks', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Marks</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={performanceForm.maxMarks}
                  onChange={(e) => handleFormChange('maxMarks', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teacher Remarks & Observations</Label>
              <Textarea
                placeholder="Qualitative performance feedback..."
                value={performanceForm.remarks}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                Clear
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Award className="h-4 w-4 mr-2" />
                Save Performance Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
