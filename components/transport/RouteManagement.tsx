'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload,
  MapPin, Clock, Users, Car, Route, Navigation, Calendar,
  AlertCircle, CheckCircle, X, ArrowRight, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';

interface BusRoute {
  id: string;
  routeName: string;
  routeCode: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  totalDistance: number;
  estimatedDuration: number;
  stops: RouteStop[];
  assignedBuses: AssignedBus[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RouteStop {
  id: string;
  stopName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  sequence: number;
  estimatedArrivalTime: string;
  isActive: boolean;
}

interface AssignedBus {
  id: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  isActive: boolean;
}

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/routes');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (data: any) => {
    try {
      const response = await fetch('/api/transport/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Route created successfully');
        setShowCreateDialog(false);
        fetchRoutes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create route');
      }
    } catch (error) {
      console.error('Error creating route:', error);
      toast.error('Failed to create route');
    }
  };

  const handleBulkCreateRoutes = async (data: any[]) => {
    try {
      const response = await fetch('/api/transport/routes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routes: data })
      });

      if (response.ok) {
        toast.success(`${data.length} routes created successfully`);
        fetchRoutes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create routes');
      }
    } catch (error) {
      console.error('Error creating routes:', error);
      toast.error('Failed to create routes');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const response = await fetch(`/api/transport/routes/${routeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Route deleted successfully');
        fetchRoutes();
      } else {
        toast.error('Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? route.isActive : !route.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const routeFields = [
    { name: 'routeName', label: 'Route Name', type: 'text' as const, required: true, placeholder: 'Route A - Downtown' },
    { name: 'routeCode', label: 'Route Code', type: 'text' as const, required: true, placeholder: 'RTE-A' },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: false, placeholder: 'Route description...' },
    { name: 'startLocation', label: 'Start Location', type: 'text' as const, required: true, placeholder: 'School Main Gate' },
    { name: 'endLocation', label: 'End Location', type: 'text' as const, required: true, placeholder: 'Downtown Area' },
    { name: 'totalDistance', label: 'Total Distance (km)', type: 'number' as const, required: true, placeholder: '15.5' },
    { name: 'estimatedDuration', label: 'Estimated Duration (minutes)', type: 'number' as const, required: true, placeholder: '45' },
    { name: 'isActive', label: 'Active Route', type: 'checkbox' as const, required: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Route Management</h2>
          <p className="text-gray-600">Manage bus routes, stops, and schedules</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
              <DialogDescription>
                Create a new bus route with stops and schedules
              </DialogDescription>
            </DialogHeader>
            <FormWithExcel
              title="Route Details"
              fields={routeFields}
              templateKey="routes"
              onSubmit={handleCreateRoute}
              onBulkSubmit={handleBulkCreateRoutes}
              submitButtonText="Add Route"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Routes ({filteredRoutes.length})</CardTitle>
              <CardDescription>All bus routes and their details</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Start → End</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Buses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.routeName}</div>
                        {route.description && (
                          <div className="text-sm text-gray-500">{route.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{route.routeCode}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <div className="font-medium">{route.startLocation}</div>
                          <div className="text-gray-500">{route.endLocation}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>{route.totalDistance} km</TableCell>
                    <TableCell>{route.estimatedDuration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{route.stops.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span>{route.assignedBuses.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.isActive ? "default" : "secondary"}>
                        {route.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowEditDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Route Details Dialog */}
      <Dialog open={!!selectedRoute && !showEditDialog} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Route Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedRoute?.routeName}
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-6">
              {/* Route Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Route Name</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.routeName}</p>
                  </div>
                  <div>
                    <Label>Route Code</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.routeCode}</p>
                  </div>
                  <div>
                    <Label>Start Location</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.startLocation}</p>
                  </div>
                  <div>
                    <Label>End Location</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.endLocation}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Total Distance</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.totalDistance} km</p>
                  </div>
                  <div>
                    <Label>Estimated Duration</Label>
                    <p className="text-sm text-gray-600">{selectedRoute.estimatedDuration} minutes</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={selectedRoute.isActive ? "default" : "secondary"}>
                      {selectedRoute.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {selectedRoute.description && (
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-gray-600">{selectedRoute.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Stops */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Stops</h3>
                <div className="space-y-2">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {stop.sequence}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{stop.stopName}</div>
                        <div className="text-sm text-gray-500">{stop.address}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {stop.estimatedArrivalTime}
                      </div>
                      <Badge variant={stop.isActive ? "default" : "secondary"}>
                        {stop.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Buses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Assigned Buses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoute.assignedBuses.map((bus) => (
                    <div key={bus.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{bus.busNumber}</div>
                        <Badge variant={bus.isActive ? "default" : "secondary"}>
                          {bus.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Driver: {bus.driverName}</div>
                        <div>Phone: {bus.driverPhone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRoute(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowEditDialog(true);
                  setSelectedRoute(null);
                }}>
                  Edit Route
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteManagement;
