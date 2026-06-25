'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Route, RefreshCw, Users, Clock } from 'lucide-react'
import { BusRouteItem } from './types'

interface BusRoutesSectionProps {
  routes: BusRouteItem[]
  isLoading: boolean
  onRefresh: () => void
}

export function BusRoutesSection({ routes, isLoading, onRefresh }: BusRoutesSectionProps) {
  const getRouteStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TIME':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">On Time</Badge>
      case 'DELAYED':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-300">Delayed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-300">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Active Bus Routes & Stops
          </CardTitle>
          <CardDescription>Transit corridors, real-time schedule statuses, and student allocations</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">No routes registered.</div>
          ) : (
            routes.map(route => (
              <div key={route.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{route.routeName}</h4>
                  {getRouteStatusBadge(route.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bus: {route.bus?.busName || route.bus?.busNumber || 'Unassigned'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {route.students?.length ?? 0} Students Allocated
                  </span>
                  {route.delayMinutes ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-3.5 h-3.5" />
                      +{route.delayMinutes}m delay
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
