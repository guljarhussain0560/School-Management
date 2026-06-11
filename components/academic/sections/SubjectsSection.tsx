'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, RefreshCw } from 'lucide-react'

export interface SubjectItem {
  id: string
  subjectName: string
  subjectCode: string
  description?: string
  isActive?: boolean
}

interface SubjectsSectionProps {
  subjects: SubjectItem[]
  isLoading: boolean
  onRefresh: () => void
}

export function SubjectsSection({ subjects, isLoading, onRefresh }: SubjectsSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Curriculum Subject Catalog
          </CardTitle>
          <CardDescription>Academic subjects, syllabus syllabi, and faculty allocations</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-muted-foreground">No subjects found in catalog.</div>
          ) : (
            subjects.map(subj => (
              <div key={subj.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{subj.subjectName}</h4>
                  <Badge variant="outline">{subj.subjectCode}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{subj.description || 'Core academic curriculum'}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
