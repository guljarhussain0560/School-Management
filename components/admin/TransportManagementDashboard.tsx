'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bus, MapPin, Wrench, AlertCircle, Shield } from 'lucide-react'
import { useTransportDashboardState } from './hooks/useTransportDashboardState'
import { RouteStatusManager } from './transport/RouteStatusManager'
import { SafetyAlertsManager } from './transport/SafetyAlertsManager'
import BusManagement from '../transport/BusManagement'
import RouteManagement from '../transport/RouteManagement'
import MaintenanceManagement from '@/components/operations/MaintenanceManagement'

interface TransportManagementDashboardProps {
  activeSubSection: string
  setActiveSubSection: (section: string) => void
}

export default function TransportManagementDashboard({
  activeSubSection,
  setActiveSubSection,
}: TransportManagementDashboardProps) {
  const {
    busRoutes,
    studentRouteForm,
    setStudentRouteForm,
    safetyAlerts,
    isLoadingAlerts,
    newAlert,
    setNewAlert,
    handleRouteStatusUpdate,
    handleStudentRouteAssignment,
    handleCreateSafetyAlert,
  } = useTransportDashboardState()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Transport & Fleet Operations</CardTitle>
              <CardDescription>
                Manage bus fleet, routes, live dispatch, vehicle maintenance, and safety alerts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeSubSection} onValueChange={setActiveSubSection} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="routes" className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="buses" className="flex items-center gap-1.5">
                <Bus className="h-4 w-4" />
                Bus Fleet
              </TabsTrigger>
              <TabsTrigger value="live-tracking" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Live Status
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Safety Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="routes">
              <RouteManagement />
            </TabsContent>

            <TabsContent value="buses">
              <BusManagement />
            </TabsContent>

            <TabsContent value="live-tracking">
              <RouteStatusManager
                busRoutes={busRoutes}
                onUpdateStatus={handleRouteStatusUpdate}
                studentRouteForm={studentRouteForm}
                setStudentRouteForm={setStudentRouteForm}
                onAssignStudent={handleStudentRouteAssignment}
              />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceManagement />
            </TabsContent>

            <TabsContent value="safety">
              <SafetyAlertsManager
                alerts={safetyAlerts}
                isLoading={isLoadingAlerts}
                newAlert={newAlert}
                setNewAlert={setNewAlert}
                onCreateAlert={handleCreateSafetyAlert}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
