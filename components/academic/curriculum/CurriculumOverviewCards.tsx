'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { CurriculumSummary } from './types'

interface CurriculumOverviewCardsProps {
  summary: CurriculumSummary
}

export function CurriculumOverviewCards({ summary }: CurriculumOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Modules</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.totalModules}</h3>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-full text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.completedModules}</h3>
          </div>
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.inProgressModules}</h3>
          </div>
          <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Progress</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.averageProgress}%</h3>
          </div>
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-full text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
