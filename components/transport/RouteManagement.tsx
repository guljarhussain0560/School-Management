'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Search, MapPin, Navigation } from 'lucide-react'
import { useRouteManagement, BusRoute } from './hooks/useRouteManagement'

export const RouteManagement: React.FC = () => {
  const {
    routes,
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
    createRoute,
    updateRoute,
    deleteRoute,
  } = useRouteManagement()

  const [formData, setFormData] = useState({
    routeName: '',
    startLocation: '',
    endLocation: '',
    totalDistance: '10',
    estimatedDuration: '30',
    description: '',
  })

  const handleOpenCreate = () => {
    setFormData({
      routeName: '',
      startLocation: '',
      endLocation: '',
      totalDistance: '10',
      estimatedDuration: '30',
      description: '',
    })
    setShowCreateDialog(true)
  }

  const handleOpenEdit = (route: BusRoute) => {
    setSelectedRoute(route)
    setFormData({
      routeName: route.routeName,
      startLocation: route.startLocation || '',
      endLocation: route.endLocation || '',
      totalDistance: String(route.totalDistance || 10),
      estimatedDuration: String(route.estimatedDuration || 30),
      description: route.description || '',
    })
    setShowEditDialog(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (showEditDialog && selectedRoute) {
      await updateRoute(selectedRoute.id, {
        ...formData,
        totalDistance: parseFloat(formData.totalDistance),
        estimatedDuration: parseInt(formData.estimatedDuration, 10),
      })
    } else {
      await createRoute({
        ...formData,
        totalDistance: parseFloat(formData.totalDistance),
        estimatedDuration: parseInt(formData.estimatedDuration, 10),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Route Management
          </h2>
          <p className="text-muted-foreground">
            Configure bus transit routes, origins, destinations, distances, and student drop-off stops.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter transit routes or search by waypoint names.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search route name, start, or destination..."
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
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Start Location</TableHead>
                <TableHead>End Location</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading bus routes...
                  </TableCell>
                </TableRow>
              ) : routes.length > 0 ? (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{route.routeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{route.startLocation || 'Campus Gate 1'}</TableCell>
                    <TableCell>{route.endLocation || 'City Center'}</TableCell>
                    <TableCell>{route.totalDistance ? `${route.totalDistance} km` : '-'}</TableCell>
                    <TableCell>{route.estimatedDuration ? `${route.estimatedDuration} mins` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={route.isActive !== false ? 'default' : 'secondary'}>
                        {route.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(route)}
                          aria-label="Edit Route"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteRoute(route.id)}
                          aria-label="Delete Route"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No routes found. Click &quot;Add Route&quot; to create a transit path.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={() => {
          setShowCreateDialog(false)
          setShowEditDialog(false)
        }}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Route' : 'Create Transit Route'}</DialogTitle>
            <DialogDescription>Define origin, destination, and transit duration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name *</Label>
              <Input
                id="route-name"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                placeholder="e.g. Route 4 - Downtown"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-loc">Start Location</Label>
                <Input
                  id="start-loc"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  placeholder="Main School Campus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-loc">End Location</Label>
                <Input
                  id="end-loc"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                  placeholder="North Terminal"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-dist">Distance (km)</Label>
                <Input
                  id="total-dist"
                  type="number"
                  step="0.1"
                  value={formData.totalDistance}
                  onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est-dur">Duration (mins)</Label>
                <Input
                  id="est-dur"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-desc">Description</Label>
              <Textarea
                id="route-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Route notes, highway numbers, etc."
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  setShowEditDialog(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Route</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RouteManagement
