'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, RefreshCw } from 'lucide-react'

export interface StudentBatch {
  id: string
  batchCode?: string
  batchName: string
  academicYear: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  startDate: string
  endDate?: string
  description?: string
}

interface BatchesSectionProps {
  batches: StudentBatch[]
  isLoading: boolean
  onRefresh: () => void
  onCreateBatch?: () => void
}

export function BatchesSection({ batches, isLoading, onRefresh, onCreateBatch }: BatchesSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Academic Batches & Cohorts
          </CardTitle>
          <CardDescription>Academic year intake cohorts and enrollment sessions</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {batches.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-muted-foreground">No academic batches configured.</div>
          ) : (
            batches.map(batch => (
              <div key={batch.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{batch.batchName}</h4>
                  <Badge variant={batch.status === 'ACTIVE' ? 'default' : 'secondary'}>{batch.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Academic Year: {batch.academicYear}</p>
                <p className="text-xs text-muted-foreground">Start Date: {new Date(batch.startDate).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
