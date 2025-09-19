'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminNavigation from '@/components/admin/AdminNavigation'
import UserManagement from '@/components/admin/UserManagement'
import UsersDashboard from '@/components/admin/UsersDashboard'
import TeacherAssignments from '@/components/admin/TeacherAssignments'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, BarChart3, Users, UserPlus, BookOpen } from 'lucide-react'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<'dashboard' | 'management' | 'assignments'>('dashboard')

  // Check if we should show management view
  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'management') {
      setCurrentView('management')
    } else if (view === 'assignments') {
      setCurrentView('assignments')
    } else {
      setCurrentView('dashboard')
    }
  }, [searchParams])

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation currentPage="users" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentView === 'dashboard' ? 'Users Dashboard' : 
                   currentView === 'management' ? 'User Management' : 'Teacher Assignments'}
                </h1>
                <p className="text-gray-600">
                  {currentView === 'dashboard' 
                    ? 'View all users under your administration' 
                    : currentView === 'management'
                    ? 'Create, update, and manage teachers and transport staff'
                    : 'Assign teachers to subjects and grades'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Toggle View Buttons */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={currentView === 'management' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('management')}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Management
                </Button>
                <Button
                  variant={currentView === 'assignments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('assignments')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Allocate Teacher
                </Button>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => router.push('/home')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Management Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentView === 'dashboard' ? <UsersDashboard /> : 
         currentView === 'management' ? <UserManagement /> : 
         <TeacherAssignments />}
      </div>
    </div>
  )
}
