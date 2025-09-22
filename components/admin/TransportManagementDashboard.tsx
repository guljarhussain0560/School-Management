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
import { 
  User, FileSpreadsheet, GraduationCap, Upload, Download, Search, 
  CheckCircle, Clock, AlertCircle, Eye, UserPlus, DollarSign, 
  Building, Users, BarChart3, Share2,
  BookOpen, Calendar, FileText, Settings, Menu, X, UploadCloud, UserPlus2,
  ChevronLeft, ChevronRight, Filter, RefreshCw, MapPin, Car, Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import MaintenanceManagement from '@/components/operations/MaintenanceManagement';
import OperationsTransport from '@/components/operations/OperationsTransport';
import BusManagement from '../transport/BusManagement';
import RouteManagement from '../transport/RouteManagement';

interface TransportManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function TransportManagementDashboard({ activeSubSection, setActiveSubSection }: TransportManagementDashboardProps) {
  const [loading, setLoading] = useState(false);

  // Transport State
  const [busRoutes, setBusRoutes] = useState([
    { id: 'A', status: 'On Time', delayReason: '', students: 25 },
    { id: 'B', status: 'Delayed', delayReason: '', students: 30 },
    { id: 'C', status: 'On Time', delayReason: '', students: 22 }
  ]);

  const [studentRouteForm, setStudentRouteForm] = useState({
    studentId: '',
    routeId: ''
  });

  const [maintenanceItems, setMaintenanceItems] = useState([
    { id: 1, name: 'Library Air Conditioning', lastChecked: '2024-01-15', status: 'OK', notes: '', photo: null as File | null },
    { id: 2, name: 'Playground Equipment', lastChecked: '2024-01-10', status: 'Needs Repair', notes: '', photo: null as File | null },
    { id: 3, name: 'Computer Lab', lastChecked: '2024-01-12', status: 'In Progress', notes: '', photo: null as File | null }
  ]);

  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  const [newAlert, setNewAlert] = useState({
    type: '',
    priority: '',
    description: ''
  });

  useEffect(() => {
    fetchSafetyAlerts();
  }, []);

  // Transport Handlers
  const handleRouteStatusUpdate = async (routeId: string, status: string, delayReason: string) => {
    try {
      const response = await fetch('/api/operations/bus-routes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId, status, delayReason })
      });

      if (response.ok) {
        setBusRoutes(prev => prev.map(route => 
          route.id === routeId ? { ...route, status, delayReason } : route
        ));
        toast.success('Route status updated successfully');
      } else {
        toast.error('Failed to update route status');
      }
    } catch (error) {
      toast.error('Error updating route status');
    }
  };

  const handleStudentRouteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/operations/bus-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentRouteForm)
      });

      if (response.ok) {
        toast.success('Student assigned to route successfully');
        setStudentRouteForm({ studentId: '', routeId: '' });
      } else {
        toast.error('Failed to assign student to route');
      }
    } catch (error) {
      toast.error('Error assigning student to route');
    }
  };

  const handleMaintenanceUpdate = async (itemId: number, notes: string, photo: File | null) => {
    try {
      const formData = new FormData();
      formData.append('itemId', itemId.toString());
      formData.append('notes', notes);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/operations/maintenance', {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setMaintenanceItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, notes, photo } : item
        ));
        toast.success('Maintenance status updated successfully');
      } else {
        toast.error('Failed to update maintenance status');
      }
    } catch (error) {
      toast.error('Error updating maintenance status');
    }
  };

  const fetchSafetyAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const response = await fetch('/api/operations/safety-alerts');
      if (response.ok) {
        const data = await response.json();
        setSafetyAlerts(data.safetyAlerts || []);
      } else {
        toast.error('Failed to fetch safety alerts');
      }
    } catch (error) {
      console.error('Error fetching safety alerts:', error);
      toast.error('Error fetching safety alerts');
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleNewAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.type || !newAlert.priority || !newAlert.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/operations/safety-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Safety alert created successfully');
        setNewAlert({ type: '', priority: '', description: '' });
        // Refresh alerts list
        fetchSafetyAlerts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create safety alert');
      }
    } catch (error) {
      console.error('Error creating safety alert:', error);
      toast.error('Error creating safety alert');
    }
  };

  const handleSyncAlerts = async () => {
    try {
      const response = await fetch('/api/operations/safety-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts: safetyAlerts })
      });

      if (response.ok) {
        toast.success('Alerts synced to dashboard successfully');
        // Refresh alerts list
        fetchSafetyAlerts();
      } else {
        toast.error('Failed to sync alerts');
      }
    } catch (error) {
      toast.error('Error syncing alerts');
    }
  };

  const renderContent = () => {
    switch (activeSubSection) {
      case 'bus-management':
        return <BusManagement />;

      case 'route-management':
        return <RouteManagement />;

      case 'operations-dashboard':
        return <OperationsTransport />;

      case 'maintenance-log':
        return <MaintenanceManagement />;

      case 'safety-alerts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Safety Alerts</h2>
              <p className="text-gray-600">Report and manage safety incidents and alerts</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Safety Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Form */}
                <form onSubmit={handleNewAlertSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="alertType">Alert Type</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value) => setNewAlert({...newAlert, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delay">Delay</SelectItem>
                          <SelectItem value="Accident">Accident</SelectItem>
                          <SelectItem value="Weather">Weather</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newAlert.priority}
                        onValueChange={(value) => setNewAlert({...newAlert, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter details"
                      value={newAlert.description}
                      onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Create Alert
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setNewAlert({ type: '', priority: '', description: '' })}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>

                {/* Recent Alerts */}
                {isLoadingAlerts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading alerts...</div>
                  </div>
                ) : safetyAlerts.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Alerts</h3>
                    <div className="space-y-3">
                      {safetyAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Alert Type: {alert.type}</p>
                              <p className="text-sm text-gray-600">{alert.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  alert.priority === 'HIGH' ? 'destructive' : 
                                  alert.priority === 'MEDIUM' ? 'secondary' : 
                                  'default'
                                }
                              >
                                {alert.priority}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {new Date(alert.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No safety alerts found. Create your first alert above.
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleSyncAlerts} variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Sync Alerts to Dashboard
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'transport-reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transport Reports</h2>
              <p className="text-gray-600">Generate comprehensive transport and operations reports</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Bus Utilization Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Bus usage and efficiency reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Route Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Route efficiency and timing reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    Maintenance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Vehicle maintenance and service reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Safety Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Safety incidents and alerts reports</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Student Transport Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Student transport usage and statistics</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Transport Cost Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Transport operational cost analysis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transport Management</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
