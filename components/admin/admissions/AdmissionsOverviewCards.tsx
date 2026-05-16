'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { AdmissionStats } from './types'

interface AdmissionsOverviewCardsProps {
  stats: AdmissionStats
  totalCount: number
}

export function AdmissionsOverviewCards({ stats, totalCount }: AdmissionsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved Admissions</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.approved}</h3>
          </div>
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Review</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pending}</h3>
          </div>
          <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Under Processing</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.underReview}</h3>
          </div>
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-full text-blue-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Enrolled</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalCount}</h3>
          </div>
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 rounded-full text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
