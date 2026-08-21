'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

export interface BusRoute {
  id: string
  routeName: string
  routeCode?: string
  description?: string
  startLocation?: string
  endLocation?: string
  totalDistance?: number
  estimatedDuration?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export function useRouteManagement() {
  const [routes, setRoutes] = useState<BusRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ routes: BusRoute[] }>('/api/transport/routes', {
        context: 'useRouteManagement.fetchRoutes',
      })
      setRoutes(data?.routes || [])
    } catch {
      // Handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const createRoute = async (routeData: Partial<BusRoute>) => {
    const result = await apiPost('/api/transport/routes', routeData, {
      showSuccessToast: true,
      successMessage: 'Route created successfully',
      context: 'useRouteManagement.createRoute',
    })
    if (result) {
      await fetchRoutes()
      setShowCreateDialog(false)
    }
    return result
  }

  const updateRoute = async (id: string, routeData: Partial<BusRoute>) => {
    const result = await apiPut(`/api/transport/routes/${id}`, routeData, {
      showSuccessToast: true,
      successMessage: 'Route updated successfully',
      context: 'useRouteManagement.updateRoute',
    })
    if (result) {
      await fetchRoutes()
      setShowEditDialog(false)
    }
    return result
  }

  const deleteRoute = async (id: string) => {
    await apiDelete(`/api/transport/routes/${id}`, {
      showSuccessToast: true,
      successMessage: 'Route deleted successfully',
      context: 'useRouteManagement.deleteRoute',
    })
    await fetchRoutes()
  }

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.startLocation && route.startLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (route.endLocation && route.endLocation.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && route.isActive !== false) ||
      (filterStatus === 'inactive' && route.isActive === false)
    return matchesSearch && matchesStatus
  })

  return {
    routes: filteredRoutes,
    rawRoutes: routes,
    loading,
    selectedRoute,
    setSelectedRoute,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
  }
}
