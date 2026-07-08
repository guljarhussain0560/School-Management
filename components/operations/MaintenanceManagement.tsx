'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wrench, Building } from 'lucide-react'
import { MaintenanceOverviewCards } from './maintenance/MaintenanceOverviewCards'
import { MaintenanceItemsSection } from './maintenance/MaintenanceItemsSection'
import { MaintenanceLogsSection } from './maintenance/MaintenanceLogsSection'
import { MaintenanceItem, MaintenanceLog, MaintenanceSummaryData } from './maintenance/types'

export default function MaintenanceManagement() {
  const [activeTab, setActiveTab] = useState('items')
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [summary, setSummary] = useState<MaintenanceSummaryData>({
    totalItems: 0,
    totalLogs: 0,
    itemsNeedingAttention: 0,
    logsNeedingAttention: 0,
    recentLogs: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/operations/maintenance/items')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || (Array.isArray(data) ? data : []))
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/operations/maintenance/logs')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || (Array.isArray(data) ? data : []))
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchItems(), fetchLogs()])
    setIsLoading(false)
  }, [fetchItems, fetchLogs])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(() => {
    setSummary({
      totalItems: items.length,
      totalLogs: logs.length,
      itemsNeedingAttention: items.filter(i => i.status === 'NEEDS_REPAIR').length,
      logsNeedingAttention: logs.filter(l => l.status === 'NEEDS_REPAIR').length,
      recentLogs: logs.length,
    })
  }, [items, logs])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Facility Maintenance & Operations
          </h2>
          <p className="text-sm text-muted-foreground">
            Track physical infrastructure health, equipment diagnostics, and repair work orders.
          </p>
        </div>
      </div>

      <MaintenanceOverviewCards summary={summary} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm mb-6">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Incident Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <MaintenanceItemsSection items={items} isLoading={isLoading} onRefresh={fetchItems} />
        </TabsContent>

        <TabsContent value="logs">
          <MaintenanceLogsSection logs={logs} isLoading={isLoading} onRefresh={fetchLogs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
