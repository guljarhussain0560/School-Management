'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { SafetyAlertItem } from '../hooks/useTransportDashboardState'

interface SafetyAlertsManagerProps {
  alerts: SafetyAlertItem[]
  isLoading: boolean
  newAlert: { type: string; priority: string; description: string }
  setNewAlert: React.Dispatch<React.SetStateAction<{ type: string; priority: string; description: string }>>
  onCreateAlert: (e: React.FormEvent) => Promise<boolean>
}

export const SafetyAlertsManager: React.FC<SafetyAlertsManagerProps> = ({
  alerts,
  isLoading,
  newAlert,
  setNewAlert,
  onCreateAlert,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return <Badge variant="destructive">{priority}</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">{priority}</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Active Safety Alerts
          </CardTitle>
          <CardDescription>Security and transit alerts for transport personnel</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">Loading safety alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No active safety alerts.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{alert.type}</span>
                    {getPriorityBadge(alert.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast Alert</CardTitle>
          <CardDescription>Issue real-time alert</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateAlert} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="alertType" className="text-xs">Type</Label>
              <Input
                id="alertType"
                placeholder="e.g. Weather, Traffic"
                value={newAlert.type}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, type: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select
                value={newAlert.priority}
                onValueChange={(val) => setNewAlert((prev) => ({ ...prev, priority: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="alertDesc" className="text-xs">Description</Label>
              <Textarea
                id="alertDesc"
                placeholder="Alert details..."
                value={newAlert.description}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <Button type="submit" size="sm" className="w-full" disabled={!newAlert.type || !newAlert.priority}>
              Send Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
