import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Save } from 'lucide-react'
import { SchoolSettings } from './hooks/useSchoolManagement'

interface SchoolSettingsSectionProps {
  settings: SchoolSettings
  onUpdate: (settings: Partial<SchoolSettings>) => Promise<void>
}

export const SchoolSettingsSection: React.FC<SchoolSettingsSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    academicYear: settings.academicYear || '2026-2027',
    sessionStart: settings.sessionStart || '2026-06-01',
    sessionEnd: settings.sessionEnd || '2027-03-31',
    startTime: settings.schoolTimings?.startTime || '08:30',
    endTime: settings.schoolTimings?.endTime || '15:30',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onUpdate({
      academicYear: formData.academicYear,
      sessionStart: formData.sessionStart,
      sessionEnd: formData.sessionEnd,
      schoolTimings: {
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic & Operations Settings</CardTitle>
        <CardDescription>
          Configure default academic session schedules, term dates, and daily working hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Current Academic Year</Label>
              <Input
                id="academicYear"
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                placeholder="2026-2027"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionStart">Session Start Date</Label>
              <Input
                id="sessionStart"
                type="date"
                value={formData.sessionStart}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionStart: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionEnd">Session End Date</Label>
              <Input
                id="sessionEnd"
                type="date"
                value={formData.sessionEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionEnd: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Daily School Starts At</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Daily School Ends At</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
