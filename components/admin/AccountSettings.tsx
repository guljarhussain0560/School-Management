'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Mail, Bell, Globe, Clock, Save } from 'lucide-react'
import { toast } from 'sonner'

interface AccountSettings {
  email: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  preferences: {
    language: string
    timezone: string
    dateFormat: string
    theme: string
  }
}

export default function AccountSettings() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<AccountSettings>({
    email: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    preferences: {
      language: 'English',
      timezone: 'UTC+05:30 (IST)',
      dateFormat: 'DD/MM/YYYY',
      theme: 'Light'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        email: session.user.email || ''
      }))
    }
    setLoading(false)
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    try {
      // This would typically save to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Account settings saved successfully')
    } catch (error) {
      toast.error('Failed to save account settings')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (type: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Manage your account preferences and notification settings</p>
      </div>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Manage your email preferences and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Primary Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Button
                variant={settings.notifications.email ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('email')}
              >
                {settings.notifications.email ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <Button
                variant={settings.notifications.push ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('push')}
              >
                {settings.notifications.push ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Button
                variant={settings.notifications.sms ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('sms')}
              >
                {settings.notifications.sms ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Set your language, timezone, and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={settings.preferences.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, language: e.target.value }
                }))}
                placeholder="Select language"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="timezone"
                  value={settings.preferences.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, timezone: e.target.value }
                  }))}
                  placeholder="Select timezone"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Input
                id="dateFormat"
                value={settings.preferences.dateFormat}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, dateFormat: e.target.value }
                }))}
                placeholder="Select date format"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={settings.preferences.theme}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, theme: e.target.value }
                }))}
                placeholder="Select theme"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
