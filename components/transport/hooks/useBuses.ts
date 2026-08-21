'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

export interface Bus {
  id: string
  busNumber: string
  registrationNumber?: string
  capacity: number
  driverName: string
  driverPhone: string
  conductorName?: string
  conductorPhone?: string
  route?: {
    id: string
    routeName: string
  }
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  fuelType?: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC'
  notes?: string
}

export interface BusRouteOption {
  id: string
  routeName: string
  isActive?: boolean
}

export function useBuses() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [routes, setRoutes] = useState<BusRouteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ buses: Bus[] }>('/api/transport/buses', {
        context: 'useBuses.fetchBuses',
      })
      setBuses(data?.buses || [])
    } catch {
      // Handled
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoutes = useCallback(async () => {
    try {
      const data = await apiGet<{ routes: BusRouteOption[] }>('/api/transport/routes', {
        showErrorToast: false,
      })
      setRoutes(data?.routes || [])
    } catch {
      // Handled
    }
  }, [])

  useEffect(() => {
    fetchBuses()
    fetchRoutes()
  }, [fetchBuses, fetchRoutes])

  const createBus = async (busData: Partial<Bus>) => {
    const result = await apiPost('/api/transport/buses', busData, {
      showSuccessToast: true,
      successMessage: 'Bus added to fleet successfully',
      context: 'useBuses.createBus',
    })
    if (result) {
      await fetchBuses()
      setShowCreateDialog(false)
    }
    return result
  }

  const updateBus = async (id: string, busData: Partial<Bus>) => {
    const result = await apiPut(`/api/transport/buses/${id}`, busData, {
      showSuccessToast: true,
      successMessage: 'Bus details updated successfully',
      context: 'useBuses.updateBus',
    })
    if (result) {
      await fetchBuses()
      setShowEditDialog(false)
    }
    return result
  }

  const deleteBus = async (id: string) => {
    await apiDelete(`/api/transport/buses/${id}`, {
      showSuccessToast: true,
      successMessage: 'Bus removed from fleet',
      context: 'useBuses.deleteBus',
    })
    await fetchBuses()
  }

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.registrationNumber && bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return {
    buses: filteredBuses,
    rawBuses: buses,
    routes,
    loading,
    selectedBus,
    setSelectedBus,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    fetchBuses,
    createBus,
    updateBus,
    deleteBus,
  }
}
