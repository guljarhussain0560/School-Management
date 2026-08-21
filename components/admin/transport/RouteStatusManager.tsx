'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BusRouteState } from '../hooks/useTransportDashboardState'

interface RouteStatusManagerProps {
  busRoutes: BusRouteState[]
  onUpdateStatus: (routeId: string, status: string, delayReason: string) => Promise<boolean>
  studentRouteForm: { studentId: string; routeId: string }
  setStudentRouteForm: React.Dispatch<React.SetStateAction<{ studentId: string; routeId: string }>>
  onAssignStudent: (e: React.FormEvent) => Promise<boolean>
}

export const RouteStatusManager: React.FC<RouteStatusManagerProps> = ({
  busRoutes,
  onUpdateStatus,
  studentRouteForm,
  setStudentRouteForm,
  onAssignStudent,
}) => {
  const [selectedRoute, setSelectedRoute] = useState('')
  const [status, setStatus] = useState('On Time')
  const [delayReason, setDelayReason] = useState('')

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoute) return
    onUpdateStatus(selectedRoute, status, delayReason)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Bus Routes</CardTitle>
          <CardDescription>Track status and student capacity on active routes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {busRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Route {route.id}</div>
                  <div className="text-sm text-muted-foreground">{route.students} Students Assigned</div>
                  {route.delayReason && (
                    <div className="text-xs text-amber-600 mt-1">Delay: {route.delayReason}</div>
                  )}
                </div>
                <Badge variant={route.status === 'On Time' ? 'default' : 'destructive'}>
                  {route.status}
                </Badge>
              </div>
            ))}
          </div>

          <form onSubmit={handleUpdate} className="pt-4 border-t space-y-3">
            <div className="font-medium text-sm">Update Route Status</div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {busRoutes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>Route {r.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Time">On Time</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'Delayed' && (
              <Input
                placeholder="Reason for delay..."
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
              />
            )}

            <Button type="submit" size="sm" disabled={!selectedRoute} className="w-full">
              Update Status
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Student to Route</CardTitle>
          <CardDescription>Assign a student ID to designated transit routes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAssignStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="e.g. STU-2026-001"
                value={studentRouteForm.studentId}
                onChange={(e) => setStudentRouteForm((prev) => ({ ...prev, studentId: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routeId">Select Route</Label>
              <Select
                value={studentRouteForm.routeId}
                onValueChange={(val) => setStudentRouteForm((prev) => ({ ...prev, routeId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {busRoutes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>Route {r.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={!studentRouteForm.studentId || !studentRouteForm.routeId} className="w-full">
              Assign Route
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
