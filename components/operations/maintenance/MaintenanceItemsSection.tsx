'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, RefreshCw, Calendar } from 'lucide-react'
import { MaintenanceItem } from './types'

interface MaintenanceItemsSectionProps {
  items: MaintenanceItem[]
  isLoading: boolean
  onRefresh: () => void
}

export function MaintenanceItemsSection({ items, isLoading, onRefresh }: MaintenanceItemsSectionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">Operational</Badge>
      case 'NEEDS_REPAIR':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-300">Needs Repair</Badge>
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
            <Wrench className="w-5 h-5 text-primary" />
            Infrastructure & Equipment Register
          </CardTitle>
          <CardDescription>Facility assets, diagnostic inspection status, and maintenance history</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-muted-foreground">No maintenance equipment items logged.</div>
          ) : (
            items.map(item => (
              <div key={item.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.description || 'General equipment asset'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Checked: {new Date(item.lastChecked).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
