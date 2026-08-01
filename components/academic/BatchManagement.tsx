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
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload, Users,
  Calendar, GraduationCap, BookOpen, AlertCircle, CheckCircle, Clock,
  BarChart3, FileSpreadsheet, UserCheck, Info
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentBatch {
  id: string;
  batchName: string;
  batchCode: string;
  academicYear: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
    classes: number;
  };
  students?: {
    id: string;
    studentId: string;
    name: string;
    class: {
      className: string;
      classCode: string;
    };
  }[];
  classes?: {
    id: string;
    className: string;
    classCode: string;
    _count: {
      students: number;
    };
  }[];
}

interface BatchManagementProps {
  activeSubSection?: string;
  setActiveSubSection?: (section: string) => void;
}

const BatchManagement: React.FC<BatchManagementProps> = ({ 
  activeSubSection = 'batch-overview',
  setActiveSubSection 
}) => {
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StudentBatch | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [batchForm, setBatchForm] = useState({
    batchName: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/academic/student-batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
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
        setShowCreateDialog(false);
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
      toast.error('Failed to create batch');
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBatch || !batchForm.batchName || !batchForm.academicYear || !batchForm.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/academic/student-batches/${selectedBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchForm)
      });

      if (response.ok) {
        toast.success('Batch updated successfully');
        setShowEditDialog(false);
        setSelectedBatch(null);
        fetchBatches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update batch');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Failed to update batch');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/academic/student-batches/${batchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Batch deleted successfully');
        fetchBatches();
      } else {
        toast.error('Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  const handleEditBatch = (batch: StudentBatch) => {
    setSelectedBatch(batch);
    setBatchForm({
      batchName: batch.batchName,
      academicYear: batch.academicYear,
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate ? batch.endDate.split('T')[0] : '',
      description: batch.description || '',
      status: batch.status
    });
    setShowEditDialog(true);
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

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // If we're in the second half of the year, it's the start of a new academic year
    if (month >= 6) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const renderBatchOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
          <p className="text-gray-600">Manage academic year batches and view student distributions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Batch
        </Button>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
            Manage and view all academic year batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batchName}</TableCell>
                      <TableCell>{batch.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{batch.batchCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
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
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderBatchOverview()}

      {/* Create Batch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Academic Year Batch</DialogTitle>
            <DialogDescription>
              Create a new batch for an academic year. Students will be automatically assigned to this batch during admission.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBatch} className="space-y-4">
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
              <Select value={batchForm.status} onValueChange={(value) => setBatchForm({...batchForm, status: value})}>
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
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Batch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch information. Note: Changing academic year may affect student assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editBatchName">Batch Name *</Label>
                <Input
                  id="editBatchName"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({...batchForm, batchName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editAcademicYear">Academic Year *</Label>
                <Input
                  id="editAcademicYear"
                  value={batchForm.academicYear}
                  onChange={(e) => setBatchForm({...batchForm, academicYear: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date *</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({...batchForm, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEndDate">End Date</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={batchForm.endDate}
                  onChange={(e) => setBatchForm({...batchForm, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select value={batchForm.status} onValueChange={(value) => setBatchForm({...batchForm, status: value})}>
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
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={batchForm.description}
                onChange={(e) => setBatchForm({...batchForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Batch</Button>
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
                  <Badge className={getStatusColor(selectedBatch.status)}>
                    {selectedBatch.status}
                  </Badge>
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
                              <p className="font-medium">{(cls.classCode || (cls as any).className || "N/A")}</p>
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
};

export default BatchManagement;