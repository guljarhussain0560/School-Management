'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Car, Plus, Search } from 'lucide-react'
import { useBuses, Bus } from './hooks/useBuses'
import { BusForm } from './BusForm'
import { BusTable } from './BusTable'

export const BusManagement: React.FC = () => {
  const {
    buses,
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
    createBus,
    updateBus,
    deleteBus,
  } = useBuses()

  const handleEdit = (bus: Bus) => {
    setSelectedBus(bus)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            Bus Fleet Management
          </h2>
          <p className="text-muted-foreground">
            Manage school transportation fleet, drivers, capacities, and vehicle status.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bus
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter fleet by operational status or search by driver and bus number.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bus number, driver name, or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">In Maintenance</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <BusTable
        buses={buses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteBus}
      />

      {showCreateDialog && (
        <BusForm
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={createBus}
          routes={routes}
          title="Register New Bus"
        />
      )}

      {showEditDialog && selectedBus && (
        <BusForm
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setSelectedBus(null)
          }}
          onSubmit={(data) => updateBus(selectedBus.id, data)}
          initialData={selectedBus}
          routes={routes}
          title="Edit Bus Details"
        />
      )}
    </div>
  )
}

export default BusManagement
