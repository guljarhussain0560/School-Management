'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bus, Route } from 'lucide-react'
import { BusFleetSection } from './transport/BusFleetSection'
import { BusRoutesSection } from './transport/BusRoutesSection'
import { BusItem, BusRouteItem } from './transport/types'

export default function OperationsTransport() {
  const [activeTab, setActiveTab] = useState('buses')
  const [buses, setBuses] = useState<BusItem[]>([])
  const [routes, setRoutes] = useState<BusRouteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBuses = useCallback(async () => {
    try {
      const res = await fetch('/api/transport/buses')
      if (res.ok) {
        const data = await res.json()
        setBuses(data.buses || (Array.isArray(data) ? data : []))
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/transport/routes')
      if (res.ok) {
        const data = await res.json()
        setRoutes(data.routes || (Array.isArray(data) ? data : []))
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchBuses(), fetchRoutes()])
    setIsLoading(false)
  }, [fetchBuses, fetchRoutes])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Transportation & Fleet Operations
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage school buses, transit routes, driver rosters, and student commute allocations.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm mb-6">
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <Bus className="w-4 h-4" />
            Vehicle Fleet
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            Transit Routes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buses">
          <BusFleetSection buses={buses} isLoading={isLoading} onRefresh={fetchBuses} />
        </TabsContent>

        <TabsContent value="routes">
          <BusRoutesSection routes={routes} isLoading={isLoading} onRefresh={fetchRoutes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
