'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { MaintenanceSummaryData } from './types'

interface MaintenanceOverviewCardsProps {
  summary: MaintenanceSummaryData
}

export function MaintenanceOverviewCards({ summary }: MaintenanceOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitored Assets</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.totalItems}</h3>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-full text-primary">
            <Wrench className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Work Logs</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.totalLogs}</h3>
          </div>
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-rose-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requires Repair</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.itemsNeedingAttention}</h3>
          </div>
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 rounded-full text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Tickets</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.logsNeedingAttention}</h3>
          </div>
          <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
