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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, Plus, Edit, Trash2, Search, Filter, Calendar, 
  FileSpreadsheet, Download, CheckCircle, XCircle, Clock, 
  AlertCircle, Info, Eye, BookOpen, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface StudentBatch {
  id: string;
  batchCode: string;
  batchName: string;
  academicYear: string;
  startDate: string;
  endDate?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  students: Array<{
    id: string;
    studentId: string;
    name: string;
    class: {
      className: string;
      classCode: string;
    };
    email?: string;
    parentContact?: string;
    status: string;
  }>;
  classes: Array<{
    id: string;
    className: string;
    classCode: string;
  _count: {
    students: number;
  };
  }>;
  _count: {
    students: number;
    classes: number;
  };
}

export default function StudentBatchManagement() {
  // State for batches
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batchName: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  });
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StudentBatch | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<StudentBatch | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBatches();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBatches = async () => {
    try {
    setIsLoadingBatches(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/academic/student-batches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error fetching batches');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchForm.batchName || !batchForm.academicYear || !batchForm.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/academic/student-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchForm)
      });

      if (response.ok) {
        toast.success('Batch created successfully');
        setIsBatchDialogOpen(false);
        setBatchForm({
          batchName: '',
          academicYear: '',
          startDate: '',
          endDate: '',
          description: '',
          status: 'ACTIVE'
        });
        fetchBatches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Error creating batch');
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBatch || !batchForm.batchName || !batchForm.academicYear || !batchForm.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/academic/student-batches/${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchForm)
      });

      if (response.ok) {
        toast.success('Batch updated successfully');
        setIsBatchDialogOpen(false);
        setEditingBatch(null);
        fetchBatches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update batch');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Error updating batch');
    }
  };

  const handleEditBatch = (batch: StudentBatch) => {
    setEditingBatch(batch);
    setBatchForm({
      batchName: batch.batchName,
      academicYear: batch.academicYear,
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate ? batch.endDate.split('T')[0] : '',
      description: batch.description || '',
      status: batch.status
    });
    setIsBatchDialogOpen(true);
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      const response = await fetch(`/api/academic/student-batches/${batchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Batch deleted successfully');
        fetchBatches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Error deleting batch');
    }
  };

  const handleViewDetails = async (batch: StudentBatch) => {
    try {
      const response = await fetch(`/api/academic/student-batches/${batch.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedBatch(data.batch);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to fetch batch details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'COMPLETED': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportBatchData = () => {
    const data = batches.map(batch => ({
      'Batch Name': batch.batchName,
      'Academic Year': batch.academicYear,
      'Batch Code': batch.batchCode,
      'Status': batch.status,
      'Students Count': batch._count.students,
      'Classes Count': batch._count.classes,
      'Start Date': new Date(batch.startDate).toLocaleDateString(),
      'End Date': batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A',
      'Created At': new Date(batch.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Batches');
    XLSX.writeFile(wb, 'batch-data.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Batch Management</h2>
          <p className="text-gray-600">View and manage academic year batches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBatchData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsBatchDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How Batch Management Works:</strong> Students are automatically assigned to batches during admission based on their admission year. 
          Each batch represents an academic year (e.g., 2024-25). You can create new batches for upcoming academic years and view student distributions.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.reduce((sum, batch) => sum + batch._count.students, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.reduce((sum, batch) => sum + batch._count.classes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
          <Card>
            <CardHeader>
          <CardTitle>Academic Year Batches</CardTitle>
          <CardDescription>
            View and manage all academic year batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBatches ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Batch Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batchName}</TableCell>
                      <TableCell>{batch.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{batch.batchCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(batch.status)}
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {batch._count.students}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {batch._count.classes}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(batch.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(batch)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBatch(batch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
                </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Batch Dialog */}
                <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
            <DialogTitle>
              {editingBatch ? 'Edit Batch' : 'Create New Academic Year Batch'}
            </DialogTitle>
                      <DialogDescription>
              {editingBatch 
                ? 'Update batch information. Note: Changing academic year may affect student assignments.'
                : 'Create a new batch for an academic year. Students will be automatically assigned to this batch during admission.'
              }
                      </DialogDescription>
                    </DialogHeader>
          <form onSubmit={editingBatch ? handleUpdateBatch : handleCreateBatch} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="batchName">Batch Name *</Label>
                          <Input
                            id="batchName"
                            value={batchForm.batchName}
                  onChange={(e) => setBatchForm({...batchForm, batchName: e.target.value})}
                  placeholder="e.g., 2024-25, Spring 2024"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="academicYear">Academic Year *</Label>
                          <Input
                            id="academicYear"
                            value={batchForm.academicYear}
                  onChange={(e) => setBatchForm({...batchForm, academicYear: e.target.value})}
                            placeholder="e.g., 2024-25"
                            required
                          />
                        </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={batchForm.startDate}
                  onChange={(e) => setBatchForm({...batchForm, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={batchForm.endDate}
                  onChange={(e) => setBatchForm({...batchForm, endDate: e.target.value})}
                          />
                        </div>
                        </div>

                        <div>
                          <Label htmlFor="status">Status</Label>
              <Select value={batchForm.status} onValueChange={(value: any) => setBatchForm({...batchForm, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={batchForm.description}
                onChange={(e) => setBatchForm({...batchForm, description: e.target.value})}
                placeholder="Optional description for this batch"
                rows={3}
              />
                      </div>

                      <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsBatchDialogOpen(false);
                setEditingBatch(null);
                setBatchForm({
                  batchName: '',
                  academicYear: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                  status: 'ACTIVE'
                });
              }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingBatch ? 'Update Batch' : 'Create Batch'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

      {/* Batch Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
            <DialogDescription>
              View detailed information about this batch including students and classes
            </DialogDescription>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="space-y-6">
              {/* Batch Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Batch Name</Label>
                  <p className="text-lg font-semibold">{selectedBatch.batchName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Academic Year</Label>
                  <p className="text-lg font-semibold">{selectedBatch.academicYear}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Batch Code</Label>
                  <p className="text-lg font-semibold">{selectedBatch.batchCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedBatch.status)}
                    <Badge className={getStatusColor(selectedBatch.status)}>
                      {selectedBatch.status}
                    </Badge>
                  </div>
              </div>
                  </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedBatch._count.students}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedBatch._count.classes}</p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-bold">
                      {new Date(selectedBatch.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Start Date</p>
                  </CardContent>
                </Card>
                </div>

              {/* Classes in this batch */}
              {selectedBatch.classes && selectedBatch.classes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Classes in this Batch</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBatch.classes.map((cls) => (
                      <Card key={cls.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{cls.className}</p>
                              <p className="text-sm text-gray-600">{cls.classCode}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{cls._count.students}</p>
                              <p className="text-xs text-gray-600">students</p>
                            </div>
              </div>
            </CardContent>
          </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Students in this batch */}
              {selectedBatch.students && selectedBatch.students.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Students in this Batch</h3>
                  <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                        {selectedBatch.students.map((student) => (
                      <TableRow key={student.id}>
                            <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                              <Badge variant="outline">{student.class.className}</Badge>
                        </TableCell>
                        <TableCell>
                              <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedBatch.description && (
            <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-700">{selectedBatch.description}</p>
            </div>
            )}
          </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
