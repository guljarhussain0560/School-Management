'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bus, RefreshCw, Users, Phone } from 'lucide-react'
import { BusItem } from './types'

interface BusFleetSectionProps {
  buses: BusItem[]
  isLoading: boolean
  onRefresh: () => void
}

export function BusFleetSection({ buses, isLoading, onRefresh }: BusFleetSectionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">Active</Badge>
      case 'MAINTENANCE':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-300">Maintenance</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            School Vehicle Fleet
          </CardTitle>
          <CardDescription>Bus fleet status, capacity allocations, and assigned chauffeurs</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-muted-foreground">No transport buses registered.</div>
          ) : (
            buses.map(bus => (
              <div key={bus.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{bus.busName || bus.busNumber}</h4>
                  {getStatusBadge(bus.status)}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">Reg: {bus.busNumber}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Capacity: {bus.capacity} seats
                  </span>
                  {bus.driverName && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {bus.driverName}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
