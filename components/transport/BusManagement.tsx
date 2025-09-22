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
  Car, MapPin, Users, Clock, AlertCircle, CheckCircle, Wrench,
  Fuel, Calendar, Phone, Mail, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';

interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  conductorName?: string;
  conductorPhone?: string;
  route?: {
    id: string;
    routeName: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC';
  yearOfManufacture: number;
  insuranceExpiry: string;
  fitnessExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  mileage: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BusRoute {
  id: string;
  routeName: string;
  description?: string;
  isActive: boolean;
}

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoute, setFilterRoute] = useState('all');

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data.buses || []);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/transport/routes');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleCreateBus = async (data: any) => {
    try {
      const response = await fetch('/api/transport/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Bus created successfully');
        setShowCreateDialog(false);
        fetchBuses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create bus');
      }
    } catch (error) {
      console.error('Error creating bus:', error);
      toast.error('Failed to create bus');
    }
  };

  const handleBulkCreateBuses = async (data: any[]) => {
    try {
      const response = await fetch('/api/transport/buses/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buses: data })
      });

      if (response.ok) {
        toast.success(`${data.length} buses created successfully`);
        fetchBuses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create buses');
      }
    } catch (error) {
      console.error('Error creating buses:', error);
      toast.error('Failed to create buses');
    }
  };

  const handleDeleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    try {
      const response = await fetch(`/api/transport/buses/${busId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Bus deleted successfully');
        fetchBuses();
      } else {
        toast.error('Failed to delete bus');
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Failed to delete bus');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'RETIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus;
    const matchesRoute = filterRoute === 'all' || bus.route?.id === filterRoute;
    
    return matchesSearch && matchesStatus && matchesRoute;
  });

  const busFields = [
    { name: 'busNumber', label: 'Bus Number', type: 'text' as const, required: true, placeholder: 'BUS-001' },
    { name: 'registrationNumber', label: 'Registration Number', type: 'text' as const, required: true, placeholder: 'MH-01-AB-1234' },
    { name: 'capacity', label: 'Seating Capacity', type: 'number' as const, required: true, placeholder: '50' },
    { name: 'driverName', label: 'Driver Name', type: 'text' as const, required: true, placeholder: 'Enter driver name' },
    { name: 'driverPhone', label: 'Driver Phone', type: 'text' as const, required: true, placeholder: '9876543210' },
    { name: 'conductorName', label: 'Conductor Name', type: 'text' as const, required: false, placeholder: 'Enter conductor name' },
    { name: 'conductorPhone', label: 'Conductor Phone', type: 'text' as const, required: false, placeholder: '9876543210' },
    { name: 'routeId', label: 'Route', type: 'select' as const, required: false,
      options: routes.map(r => ({ value: r.id, label: r.routeName }))
    },
    { name: 'status', label: 'Status', type: 'select' as const, required: true,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'RETIRED', label: 'Retired' }
      ]
    },
    { name: 'fuelType', label: 'Fuel Type', type: 'select' as const, required: true,
      options: [
        { value: 'PETROL', label: 'Petrol' },
        { value: 'DIESEL', label: 'Diesel' },
        { value: 'CNG', label: 'CNG' },
        { value: 'ELECTRIC', label: 'Electric' }
      ]
    },
    { name: 'yearOfManufacture', label: 'Year of Manufacture', type: 'number' as const, required: true, placeholder: '2020' },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' as const, required: true },
    { name: 'fitnessExpiry', label: 'Fitness Expiry', type: 'date' as const, required: true },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date' as const, required: false },
    { name: 'nextServiceDate', label: 'Next Service Date', type: 'date' as const, required: false },
    { name: 'mileage', label: 'Current Mileage', type: 'number' as const, required: false, placeholder: '50000' },
    { name: 'notes', label: 'Notes', type: 'textarea' as const, required: false, placeholder: 'Additional notes...' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Bus Management</h2>
          <p className="text-gray-600">Manage school buses, drivers, and vehicle information</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Bus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
              <DialogDescription>
                Register a new bus with all necessary details
              </DialogDescription>
            </DialogHeader>
            <FormWithExcel
              title="Bus Details"
              fields={busFields}
              templateKey="buses"
              onSubmit={handleCreateBus}
              onBulkSubmit={handleBulkCreateBuses}
              submitButtonText="Add Bus"
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
                  placeholder="Search buses..."
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="route-filter">Route</Label>
              <Select value={filterRoute} onValueChange={setFilterRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="All Routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buses Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Buses ({filteredBuses.length})</CardTitle>
              <CardDescription>All registered school buses</CardDescription>
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
                  <TableHead>Bus Number</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.busNumber}</TableCell>
                    <TableCell>{bus.registrationNumber}</TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bus.driverName}</div>
                        <div className="text-sm text-gray-500">{bus.driverPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bus.route ? (
                        <Badge variant="outline">{bus.route.routeName}</Badge>
                      ) : (
                        <span className="text-gray-400">No route assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bus.status)}>
                        {bus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bus.fuelType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBus(bus);
                            setShowEditDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBus(bus);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBus(bus.id)}
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

      {/* Bus Details Dialog */}
      <Dialog open={!!selectedBus && !showEditDialog} onOpenChange={() => setSelectedBus(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bus Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedBus?.busNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedBus && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Bus Number</Label>
                    <p className="text-sm text-gray-600">{selectedBus.busNumber}</p>
                  </div>
                  <div>
                    <Label>Registration Number</Label>
                    <p className="text-sm text-gray-600">{selectedBus.registrationNumber}</p>
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <p className="text-sm text-gray-600">{selectedBus.capacity} seats</p>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <p className="text-sm text-gray-600">{selectedBus.fuelType}</p>
                  </div>
                  <div>
                    <Label>Year of Manufacture</Label>
                    <p className="text-sm text-gray-600">{selectedBus.yearOfManufacture}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedBus.status)}>
                      {selectedBus.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Driver Name</Label>
                    <p className="text-sm text-gray-600">{selectedBus.driverName}</p>
                  </div>
                  <div>
                    <Label>Driver Phone</Label>
                    <p className="text-sm text-gray-600">{selectedBus.driverPhone}</p>
                  </div>
                  {selectedBus.conductorName && (
                    <>
                      <div>
                        <Label>Conductor Name</Label>
                        <p className="text-sm text-gray-600">{selectedBus.conductorName}</p>
                      </div>
                      <div>
                        <Label>Conductor Phone</Label>
                        <p className="text-sm text-gray-600">{selectedBus.conductorPhone}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Route</Label>
                    <p className="text-sm text-gray-600">
                      {selectedBus.route?.routeName || 'No route assigned'}
                    </p>
                  </div>
                  <div>
                    <Label>Current Mileage</Label>
                    <p className="text-sm text-gray-600">{selectedBus.mileage || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Important Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Insurance Expiry</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBus.insuranceExpiry).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Fitness Expiry</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBus.fitnessExpiry).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Last Service Date</Label>
                    <p className="text-sm text-gray-600">
                      {selectedBus.lastServiceDate ? new Date(selectedBus.lastServiceDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label>Next Service Date</Label>
                    <p className="text-sm text-gray-600">
                      {selectedBus.nextServiceDate ? new Date(selectedBus.nextServiceDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBus.notes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <div>
                    <Label>Additional Notes</Label>
                    <p className="text-sm text-gray-600">{selectedBus.notes}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBus(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowEditDialog(true);
                  setSelectedBus(null);
                }}>
                  Edit Bus
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusManagement;
