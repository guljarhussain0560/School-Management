'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { School, Settings } from 'lucide-react'
import { useSchoolManagement } from './hooks/useSchoolManagement'
import { SchoolProfileSection } from './SchoolProfileSection'
import { SchoolSettingsSection } from './SchoolSettingsSection'

export default function SchoolManagement() {
  const {
    activeTab,
    setActiveTab,
    profile,
    settings,
    loading,
    handleUpdateProfile,
    handleUpdateSettings,
  } = useSchoolManagement()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Institutional Management</h1>
        <p className="text-muted-foreground">
          Configure school identity, registration codes, contact info, and calendar schedules.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full md:w-80">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            <span>School Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings & Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <SchoolProfileSection
            profile={profile}
            loading={loading}
            onUpdate={handleUpdateProfile}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SchoolSettingsSection
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
