'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, RefreshCw } from 'lucide-react'

export interface ClassItem {
  id: string
  className?: string
  classCode: string
  description?: string
  capacity: number
  batch?: {
    batchName: string
    academicYear: string
  }
  _count?: {
    students: number
    subjects: number
  }
}

interface ClassesSectionProps {
  classes: ClassItem[]
  isLoading: boolean
  onRefresh: () => void
}

export function ClassesSection({ classes, isLoading, onRefresh }: ClassesSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Classrooms & Batch Sections
          </CardTitle>
          <CardDescription>Section capacities, student roll allocations, and assigned curriculum</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-muted-foreground">No classroom sections registered.</div>
          ) : (
            classes.map(cls => (
              <div key={cls.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{(cls.classCode || (cls as any).className || "N/A") || cls.classCode}</h4>
                  <Badge variant="outline">{cls.classCode}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cls._count?.students ?? 0} / {cls.capacity} Students
                  </span>
                  <span>Batch: {cls.batch?.batchName || 'General'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
