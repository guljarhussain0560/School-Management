'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bus, Route, Users, Search, Plus, Edit, Trash2, Upload, Download, 
  MapPin, Phone, User, Clock, AlertCircle, CheckCircle, XCircle,
  FileSpreadsheet, RefreshCw, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Bus {
  id: string;
  busNumber: string;
  busName?: string;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  routes: Array<{
    id: string;
    routeName: string;
    status: string;
  }>;
}

interface BusRoute {
  id: string;
  routeName: string;
  busId: string;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  delayReason?: string;
  delayMinutes?: number;
  lastUpdated?: string;
  bus: {
    id: string;
    busNumber: string;
    busName?: string;
    driverName?: string;
    capacity: number;
  };
  manager: {
    id: string;
    name: string;
    email: string;
  };
  students: Array<{
    id: string;
    studentId: string;
    name: string;
    grade: string;
  }>;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  pickupAddress?: string;
  parentContact?: string;
  busRouteId?: string;
  busRoute?: {
    id: string;
    routeName: string;
    bus: {
      id: string;
      busNumber: string;
      busName?: string;
      driverName?: string;
    };
  };
}

export default function OperationsTransport() {
  // State for buses
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoadingBuses, setIsLoadingBuses] = useState(false);
  const [busForm, setBusForm] = useState({
    route: 1,
    capacity: 'MEDIUM' as 'SMALL' | 'MEDIUM' | 'LARGE',
    busName: '',
    driverName: '',
    driverPhone: '',
    conductorName: '',
    conductorPhone: '',
    status: 'ACTIVE' as const
  });
  const [isBusDialogOpen, setIsBusDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  // State for routes
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    busId: '',
    status: 'ON_TIME' as const
  });
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);

  // State for student assignments
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  // State for Excel upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, [currentPage, searchTerm, statusFilter]);

  // Bus Management Functions
  const fetchBuses = async () => {
    setIsLoadingBuses(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/operations/buses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBuses(data.buses || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch buses');
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Error fetching buses');
    } finally {
      setIsLoadingBuses(false);
    }
  };

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBus ? `/api/operations/buses/${editingBus.id}` : '/api/operations/buses';
      const method = editingBus ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setBusForm({
          route: 1,
          capacity: 'MEDIUM',
          busName: '',
          driverName: '',
          driverPhone: '',
          conductorName: '',
          conductorPhone: '',
          status: 'ACTIVE'
        });
        setIsBusDialogOpen(false);
        setEditingBus(null);
        fetchBuses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save bus');
      }
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error('Error saving bus');
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber,
      busName: bus.busName || '',
      capacity: bus.capacity as 'SMALL' | 'MEDIUM' | 'LARGE',
      driverName: bus.driverName || '',
      driverPhone: bus.driverPhone || '',
      conductorName: bus.conductorName || '',
      conductorPhone: bus.conductorPhone || '',
      status: bus.status as 'ACTIVE'
    });
    setIsBusDialogOpen(true);
  };

  const handleDeleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    try {
      const response = await fetch(`/api/operations/buses/${busId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Bus deleted successfully');
        fetchBuses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete bus');
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Error deleting bus');
    }
  };

  // Route Management Functions
  const fetchRoutes = async () => {
    setIsLoadingRoutes(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/operations/bus-routes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Error fetching routes');
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoute ? `/api/operations/bus-routes/${editingRoute.id}` : '/api/operations/bus-routes';
      const method = editingRoute ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setRouteForm({
          routeName: '',
          busId: '',
          status: 'ON_TIME'
        });
        setIsRouteDialogOpen(false);
        setEditingRoute(null);
        fetchRoutes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save route');
      }
    } catch (error) {
      console.error('Error saving route:', error);
      toast.error('Error saving route');
    }
  };

  const handleEditRoute = (route: BusRoute) => {
    setEditingRoute(route);
    setRouteForm({
      routeName: route.routeName,
      busId: route.busId,
      status: route.status as 'ON_TIME'
    });
    setIsRouteDialogOpen(true);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const response = await fetch(`/api/operations/bus-routes/${routeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Route deleted successfully');
        fetchRoutes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Error deleting route');
    }
  };

  // Student Assignment Functions
  const searchStudents = async () => {
    if (!studentSearch.trim()) return;

    setIsLoadingStudents(true);
    try {
      const response = await fetch(`/api/operations/students/search?search=${encodeURIComponent(studentSearch)}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        toast.error('Failed to search students');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Error searching students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSelectedRoute(student.busRouteId || '');
    setIsAssignmentDialogOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedRoute) return;

    try {
      const response = await fetch('/api/operations/student-route-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.studentId,
          routeId: selectedRoute
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setIsAssignmentDialogOpen(false);
        setSelectedStudent(null);
        setSelectedRoute('');
        searchStudents(); // Refresh the search results
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign student');
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error('Error assigning student');
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/operations/student-route-assignment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        searchStudents(); // Refresh the search results
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to unassign student');
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      toast.error('Error unassigning student');
    }
  };

  // Excel Upload Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/operations/student-route-assignment/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        toast.success(`Upload completed: ${data.results.success} successful, ${data.results.failed} failed`);
        
        if (data.results.errors.length > 0) {
          console.error('Upload errors:', data.results.errors);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/operations/student-route-assignment/upload');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_route_assignment_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template downloaded successfully');
      } else {
        toast.error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error downloading template');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      MAINTENANCE: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      OUT_OF_SERVICE: { color: 'bg-red-100 text-red-800', icon: XCircle },
      ON_TIME: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      DELAYED: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operations & Transport</h2>
          <p className="text-gray-600">Manage buses, routes, and student assignments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="buses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buses">Bus Management</TabsTrigger>
          <TabsTrigger value="routes">Route Management</TabsTrigger>
          <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
          <TabsTrigger value="upload">Excel Upload</TabsTrigger>
        </TabsList>

        {/* Bus Management Tab */}
        <TabsContent value="buses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bus Management</CardTitle>
                  <CardDescription>Manage school buses and their details</CardDescription>
                </div>
                <Dialog open={isBusDialogOpen} onOpenChange={setIsBusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingBus(null);
                      setBusForm({
                        busNumber: '',
                        busName: '',
                        capacity: 'MEDIUM',
                        driverName: '',
                        driverPhone: '',
                        conductorName: '',
                        conductorPhone: '',
                        status: 'ACTIVE'
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bus
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
                      <DialogDescription>
                        {editingBus ? 'Update bus information' : 'Add a new bus to the fleet'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBusSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="route">Route Number *</Label>
                          <Input
                            id="route"
                            type="number"
                            value={busForm.route}
                            onChange={(e) => setBusForm({ ...busForm, route: parseInt(e.target.value) })}
                            placeholder="e.g., 1, 2, 3"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacity *</Label>
                          <Select value={busForm.capacity} onValueChange={(value: 'SMALL' | 'MEDIUM' | 'LARGE') => setBusForm({ ...busForm, capacity: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SMALL">Small (20-30)</SelectItem>
                              <SelectItem value="MEDIUM">Medium (31-45)</SelectItem>
                              <SelectItem value="LARGE">Large (46+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="busName">Bus Name</Label>
                          <Input
                            id="busName"
                            value={busForm.busName}
                            onChange={(e) => setBusForm({ ...busForm, busName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="driverName">Driver Name</Label>
                          <Input
                            id="driverName"
                            value={busForm.driverName}
                            onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={busForm.status} onValueChange={(value: any) => setBusForm({ ...busForm, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="driverName">Driver Name</Label>
                          <Input
                            id="driverName"
                            value={busForm.driverName}
                            onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="driverPhone">Driver Phone</Label>
                          <Input
                            id="driverPhone"
                            value={busForm.driverPhone}
                            onChange={(e) => setBusForm({ ...busForm, driverPhone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="conductorName">Conductor Name</Label>
                          <Input
                            id="conductorName"
                            value={busForm.conductorName}
                            onChange={(e) => setBusForm({ ...busForm, conductorName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="conductorPhone">Conductor Phone</Label>
                          <Input
                            id="conductorPhone"
                            value={busForm.conductorPhone}
                            onChange={(e) => setBusForm({ ...busForm, conductorPhone: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsBusDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingBus ? 'Update Bus' : 'Add Bus'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search buses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingBuses ? (
                  <div className="text-center py-8">Loading buses...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bus Number</TableHead>
                        <TableHead>Bus Name</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Routes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buses.map((bus) => (
                        <TableRow key={bus.id}>
                          <TableCell className="font-medium">{bus.busNumber}</TableCell>
                          <TableCell>{bus.busName || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bus.driverName || '-'}</div>
                              {bus.driverPhone && (
                                <div className="text-sm text-gray-500">{bus.driverPhone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{bus.capacity}</TableCell>
                          <TableCell>{getStatusBadge(bus.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bus.routes.length} routes</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditBus(bus)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteBus(bus.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Management Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Route Management</CardTitle>
                  <CardDescription>Manage bus routes and their status</CardDescription>
                </div>
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingRoute(null);
                      setRouteForm({
                        routeName: '',
                        busId: '',
                        status: 'ON_TIME'
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                      <DialogDescription>
                        {editingRoute ? 'Update route information' : 'Create a new bus route'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRouteSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="routeName">Route Name *</Label>
                        <Input
                          id="routeName"
                          value={routeForm.routeName}
                          onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="busId">Select Bus *</Label>
                        <Select value={routeForm.busId} onValueChange={(value) => setRouteForm({ ...routeForm, busId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bus" />
                          </SelectTrigger>
                          <SelectContent>
                            {buses.filter(bus => bus.status === 'ACTIVE').map((bus) => (
                              <SelectItem key={bus.id} value={bus.id}>
                                {bus.busNumber} - {bus.busName || 'Unnamed'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={routeForm.status} onValueChange={(value: any) => setRouteForm({ ...routeForm, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ON_TIME">On Time</SelectItem>
                            <SelectItem value="DELAYED">Delayed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsRouteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRoute ? 'Update Route' : 'Add Route'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ON_TIME">On Time</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingRoutes ? (
                  <div className="text-center py-8">Loading routes...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Bus</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.routeName}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{route.bus.busNumber}</div>
                              <div className="text-sm text-gray-500">{route.bus.busName || 'Unnamed'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{route.bus.driverName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{route.students.length}/{route.bus.capacity}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(route.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditRoute(route)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteRoute(route.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Assignment Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Route Assignment</CardTitle>
              <CardDescription>Assign students to bus routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by Student ID or Name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                  <Button onClick={searchStudents} disabled={!studentSearch.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {isLoadingStudents ? (
                  <div className="text-center py-8">Searching students...</div>
                ) : students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <Card key={student.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-gray-500">ID: {student.studentId} | Grade: {student.grade}</div>
                                {student.pickupAddress && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {student.pickupAddress}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {student.busRoute ? (
                              <div className="text-right">
                                <div className="text-sm font-medium">Assigned to:</div>
                                <div className="text-sm text-gray-500">
                                  {student.busRoute.routeName} - {student.busRoute.bus.busNumber}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnassignStudent(student.studentId)}
                                  className="mt-2"
                                >
                                  Unassign
                                </Button>
                              </div>
                            ) : (
                              <div className="text-right">
                                {!student.pickupAddress ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      Pickup address not found. Please update student profile.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStudentSelect(student)}
                                  >
                                    Assign Route
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : studentSearch ? (
                  <div className="text-center py-8 text-gray-500">No students found</div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Enter a student ID or name to search</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Dialog */}
          <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Student to Route</DialogTitle>
                <DialogDescription>
                  Assign {selectedStudent?.name} to a bus route
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">{selectedStudent?.name}</div>
                    <div className="text-sm text-gray-500">ID: {selectedStudent?.studentId} | Grade: {selectedStudent?.grade}</div>
                    {selectedStudent?.pickupAddress && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedStudent.pickupAddress}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="routeSelect">Select Route</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.filter(route => route.status === 'ON_TIME' || route.status === 'DELAYED').map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeName} - {route.bus.busNumber} ({route.students.length}/{route.bus.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignStudent} disabled={!selectedRoute}>
                  Assign Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Excel Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Excel Upload</CardTitle>
              <CardDescription>Upload student route assignments via Excel file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload Excel File</h3>
                    <p className="text-gray-500">Upload a properly formatted Excel file with student route assignments</p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={downloadTemplate} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                          aria-label="Choose Excel file to upload"
                        />
                        <Button disabled={isUploading}>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? 'Uploading...' : 'Choose File'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Excel Format Requirements:</strong>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Student ID - The unique student identifier</li>
                      <li>Route ID - The ID of the route to assign</li>
                      <li>Students must have a pickup address in their profile</li>
                      <li>Route must exist and have available capacity</li>
                      <li>Student must not already be assigned to a route</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
