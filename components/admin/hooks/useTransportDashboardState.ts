'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

export interface BusRouteState {
  id: string
  status: string
  delayReason: string
  students: number
}

export interface SafetyAlertItem {
  id: string
  type: string
  priority: string
  description: string
  status: string
  createdAt?: string
}

export function useTransportDashboardState() {
  const [busRoutes, setBusRoutes] = useState<BusRouteState[]>([
    { id: 'A', status: 'On Time', delayReason: '', students: 25 },
    { id: 'B', status: 'Delayed', delayReason: '', students: 30 },
    { id: 'C', status: 'On Time', delayReason: '', students: 22 },
  ])

  const [studentRouteForm, setStudentRouteForm] = useState({
    studentId: '',
    routeId: '',
  })

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlertItem[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)

  const [newAlert, setNewAlert] = useState({
    type: '',
    priority: '',
    description: '',
  })

  const fetchSafetyAlerts = useCallback(async () => {
    try {
      setIsLoadingAlerts(true)
      const data = await apiGet<any>('/api/operations/safety-alerts', {
        showErrorToast: false,
        context: 'useTransportDashboardState',
      }).catch(() => ({ alerts: [] }))
      setSafetyAlerts(data.alerts || [])
    } catch (error) {
      logger.error('Error fetching safety alerts', error as Error, { context: 'useTransportDashboardState' })
    } finally {
      setIsLoadingAlerts(false)
    }
  }, [])

  const handleRouteStatusUpdate = async (routeId: string, status: string, delayReason: string) => {
    try {
      await apiPut('/api/operations/bus-routes', { routeId, status, delayReason }, {
        showSuccessToast: true,
        successMessage: 'Route status updated successfully',
        context: 'handleRouteStatusUpdate',
      })

      setBusRoutes((prev) =>
        prev.map((route) => (route.id === routeId ? { ...route, status, delayReason } : route))
      )
      return true
    } catch (error) {
      logger.error('Error updating route status', error as Error, { context: 'useTransportDashboardState' })
      return false
    }
  }

  const handleStudentRouteAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/operations/bus-routes', studentRouteForm, {
        showSuccessToast: true,
        successMessage: 'Student assigned to route successfully',
        context: 'handleStudentRouteAssignment',
      })
      setStudentRouteForm({ studentId: '', routeId: '' })
      return true
    } catch (error) {
      logger.error('Error assigning student to route', error as Error, { context: 'useTransportDashboardState' })
      return false
    }
  }

  const handleCreateSafetyAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await apiPost<any>('/api/operations/safety-alerts', newAlert, {
        showSuccessToast: true,
        successMessage: 'Safety alert created successfully',
        context: 'handleCreateSafetyAlert',
      })
      if (data?.alert) {
        setSafetyAlerts((prev) => [data.alert, ...prev])
      }
      setNewAlert({ type: '', priority: '', description: '' })
      return true
    } catch (error) {
      logger.error('Error creating safety alert', error as Error, { context: 'useTransportDashboardState' })
      return false
    }
  }

  useEffect(() => {
    fetchSafetyAlerts()
  }, [fetchSafetyAlerts])

  return {
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
  }
}
