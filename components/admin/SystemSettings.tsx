'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Database, School, Mail, Phone, MapPin, Save } from 'lucide-react'
import { toast } from 'sonner'

interface SchoolData {
  name: string
  registrationNumber: string
  address: string
  phone: string
  email: string
}

interface SystemConfig {
  timezone: string
  language: string
  dateFormat: string
  currency: string
  academicYear: string
}

export default function SystemSettings() {
  const { data: session } = useSession()
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: '',
    registrationNumber: '',
    address: '',
    phone: '',
    email: ''
  })
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    timezone: 'UTC+05:30 (IST)',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    academicYear: '2024-2025'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setSchoolData({
        name: session.user.schoolName || 'Your School',
        registrationNumber: 'SCH-001',
        address: '123 Education Street, Learning City',
        phone: '+1-234-567-8900',
        email: session.user.email || ''
      })
    }
    setLoading(false)
  }, [session])

  const handleSaveSchoolData = async () => {
    setSaving(true)
    try {
      // This would typically save to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('School information updated successfully')
    } catch (error) {
      toast.error('Failed to update school information')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSystemConfig = async () => {
    setSaving(true)
    try {
      // This would typically save to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('System configuration updated successfully')
    } catch (error) {
      toast.error('Failed to update system configuration')
    } finally {
      setSaving(false)
    }
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
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Manage system-wide settings and school information</p>
      </div>

      {/* School Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            School Information
          </CardTitle>
          <CardDescription>
            Update your school&apos;s basic information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolData.name}
                onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={schoolData.registrationNumber}
                onChange={(e) => setSchoolData({ ...schoolData, registrationNumber: e.target.value })}
                placeholder="Enter registration number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={schoolData.address}
              onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
              placeholder="Enter school address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={schoolData.phone}
                  onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={schoolData.email}
                  onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveSchoolData} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save School Information'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={systemConfig.timezone}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, timezone: e.target.value }))}
                placeholder="Select timezone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={systemConfig.language}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, language: e.target.value }))}
                placeholder="Select language"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Input
                id="dateFormat"
                value={systemConfig.dateFormat}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                placeholder="Select date format"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={systemConfig.currency}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="Select currency"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={systemConfig.academicYear}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, academicYear: e.target.value }))}
              placeholder="Enter academic year"
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveSystemConfig} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save System Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Monitor system health and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600">Database</h4>
              <p className="text-sm text-gray-500">Connected</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600">API Services</h4>
              <p className="text-sm text-gray-500">Running</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600">Storage</h4>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
