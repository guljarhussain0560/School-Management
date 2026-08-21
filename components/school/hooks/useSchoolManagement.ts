import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface SchoolProfile {
  id: string
  schoolName: string
  schoolCode: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  phone: string
  email: string
  website?: string
  establishedYear: number
  affiliation: string
  board: string
  principalName: string
  principalEmail: string
  principalPhone: string
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  logo?: string
  motto?: string
  vision?: string
  mission?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SchoolSettings {
  academicYear: string
  sessionStart: string
  sessionEnd: string
  workingDays: string[]
  schoolTimings: {
    startTime: string
    endTime: string
  }
}

export function useSchoolManagement() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<SchoolProfile | null>(null)
  const [settings, setSettings] = useState<SchoolSettings>({
    academicYear: '2026-2027',
    sessionStart: '2026-06-01',
    sessionEnd: '2027-03-31',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    schoolTimings: {
      startTime: '08:30',
      endTime: '15:30',
    },
  })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/school/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile || null)
      }
    } catch (error) {
      logger.error('Error fetching school profile', error as Error, { context: 'useSchoolManagement' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/school/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      logger.error('Error fetching school settings', error as Error, { context: 'useSchoolManagement' })
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchSettings()
  }, [])

  const handleUpdateProfile = async (updatedData: Partial<SchoolProfile>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/school/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        toast.success('School profile updated successfully')
        setIsEditing(false)
        fetchProfile()
      } else {
        toast.error('Failed to update school profile')
      }
    } catch (error) {
      logger.error('Error updating school profile', error as Error)
      toast.error('Error updating school profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (updatedSettings: Partial<SchoolSettings>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/school/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      })

      if (response.ok) {
        toast.success('School settings saved')
        fetchSettings()
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      logger.error('Error updating school settings', error as Error)
      toast.error('Error updating settings')
    } finally {
      setLoading(false)
    }
  }

  return {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    settings,
    setSettings,
    loading,
    isEditing,
    setIsEditing,
    handleUpdateProfile,
    handleUpdateSettings,
  }
}
