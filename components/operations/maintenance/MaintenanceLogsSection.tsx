'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, RefreshCw, Calendar, User } from 'lucide-react'
import { MaintenanceLog } from './types'

interface MaintenanceLogsSectionProps {
  logs: MaintenanceLog[]
  isLoading: boolean
  onRefresh: () => void
}

export function MaintenanceLogsSection({ logs, isLoading, onRefresh }: MaintenanceLogsSectionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">Resolved</Badge>
      case 'NEEDS_REPAIR':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-300">Issue Reported</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-300">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Facility Incident & Repair Logs
          </CardTitle>
          <CardDescription>Audited tickets, inspection findings, and physical facility repairs</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">No facility incident logs found.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{log.facility}</h4>
                  {getStatusBadge(log.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{log.notes || 'Routine facility inspection'}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {log.reporter?.name || log.reportedBy || 'Staff'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
