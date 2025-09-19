'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Truck, Shield, TrendingUp, Activity } from 'lucide-react'

interface StatsData {
  totalUsers: number
  teachers: number
  transportStaff: number
  activeUsers: number
  recentActivity: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    teachers: 0,
    transportStaff: 0,
    activeUsers: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          const users = data.users
          
          setStats({
            totalUsers: users.length,
            teachers: users.filter((u: any) => u.role === 'TEACHER').length,
            transportStaff: users.filter((u: any) => u.role === 'TRANSPORT').length,
            activeUsers: users.filter((u: any) => u.isActive).length,
            recentActivity: users.filter((u: any) => {
              const createdAt = new Date(u.createdAt)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return createdAt > weekAgo
            }).length
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Teachers',
      value: stats.teachers,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Transport Staff',
      value: stats.transportStaff,
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      subtitle: 'New users this week'
    },
    {
      title: 'Admin Access',
      value: '1',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subtitle: 'You'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
