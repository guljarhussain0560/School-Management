'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, GraduationCap, BarChart3, Calendar, 
  UserPlus, FileSpreadsheet, Download, Upload,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import StudentBatchManagement from '@/components/academic/StudentBatchManagement';

interface BatchManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function BatchManagementDashboard({ 
  activeSubSection, 
  setActiveSubSection 
}: BatchManagementDashboardProps) {
  const [batchStats, setBatchStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    archivedBatches: 0,
    totalStudents: 0,
    unassignedStudents: 0
  });

  const [recentBatches, setRecentBatches] = useState([]);

  useEffect(() => {
    fetchBatchStats();
  }, []);

  const fetchBatchStats = async () => {
    try {
      const response = await fetch('/api/academic/student-batches/stats');
      if (response.ok) {
        const data = await response.json();
        setBatchStats(data.stats);
        setRecentBatches(data.recentBatches || []);
      }
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeSubSection) {
      case 'batch-management':
        return <StudentBatchManagement />;
      
      default:
        return <StudentBatchManagement />;
    }
  };

  const getStatusBadge = (status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
        <p className="text-gray-600">Organize and manage student batches, academic years, and student assignments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchStats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">
              {batchStats.activeBatches} active batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{batchStats.activeBatches}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Batches</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{batchStats.archivedBatches}</div>
            <p className="text-xs text-muted-foreground">
              Historical records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{batchStats.unassignedStudents}</div>
            <p className="text-xs text-muted-foreground">
              Need batch assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="batch-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batch-management">Batch Management</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="batch-management" className="space-y-4">
          {renderContent()}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Batches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Batches
                </CardTitle>
                <CardDescription>
                  Latest created student batches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBatches.length > 0 ? (
                    recentBatches.map((batch: any) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{batch.batchName}</h4>
                          <p className="text-sm text-gray-600">{batch.academicYear}</p>
                          <p className="text-xs text-gray-500">
                            {batch._count.students} students
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(batch.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No batches created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common batch management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Create New Batch</h4>
                        <p className="text-sm text-gray-600">Start a new academic year batch</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Bulk Assignment</h4>
                        <p className="text-sm text-gray-600">Assign multiple students to batches</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-gray-600">Download batch and student data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
