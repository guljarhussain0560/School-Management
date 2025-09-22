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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, Plus, Edit, Trash2, Search, Filter, Calendar, 
  UserPlus, UserMinus, FileSpreadsheet, Download, Upload,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface StudentBatch {
  id: string;
  batchCode: string; // Generated batch code
  batchName: string;
  academicYear: string;
  startDate: string;
  endDate?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
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
  _count: {
    students: number;
  };
}

interface Student {
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
  batchId?: string;
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
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  });
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StudentBatch | null>(null);

  // State for students
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  // State for assignment dialog
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isUnassignmentDialogOpen, setIsUnassignmentDialogOpen] = useState(false);

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, [currentPage, searchTerm, statusFilter]);

  // Batch Management Functions
  const fetchBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/academic/student-batches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch student batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error fetching student batches');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch('/api/students/list');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBatch ? `/api/academic/student-batches/${editingBatch.id}` : '/api/academic/student-batches';
      const method = editingBatch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setBatchForm({
          batchName: '',
          academicYear: '',
          startDate: '',
          endDate: '',
          description: '',
          status: 'ACTIVE'
        });
        setIsBatchDialogOpen(false);
        setEditingBatch(null);
        fetchBatches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save batch');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('Error saving batch');
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

  // Student Assignment Functions
  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0 || !selectedBatch) return;

    try {
      const response = await fetch('/api/academic/student-batches/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents,
          batchId: selectedBatch
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setSelectedStudents([]);
        setSelectedBatch('');
        setIsAssignmentDialogOpen(false);
        fetchBatches();
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign students');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('Error assigning students');
    }
  };

  const handleUnassignStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      const response = await fetch('/api/academic/student-batches/assign', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setSelectedStudents([]);
        setIsUnassignmentDialogOpen(false);
        fetchBatches();
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to unassign students');
      }
    } catch (error) {
      console.error('Error unassigning students:', error);
      toast.error('Error unassigning students');
    }
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Batch Management</h2>
          <p className="text-gray-600">Organize students into academic batches and manage assignments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAssignmentDialogOpen(true)} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Students
          </Button>
          <Button onClick={() => setIsUnassignmentDialogOpen(true)} variant="outline">
            <UserMinus className="w-4 h-4 mr-2" />
            Unassign Students
          </Button>
        </div>
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Batch Management</TabsTrigger>
          <TabsTrigger value="students">Student Overview</TabsTrigger>
        </TabsList>

        {/* Batch Management Tab */}
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Batches</CardTitle>
                  <CardDescription>Manage academic batches and student assignments</CardDescription>
                </div>
                <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
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
                      <Plus className="w-4 h-4 mr-2" />
                      Create Batch
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
                      <DialogDescription>
                        {editingBatch ? 'Update batch information' : 'Create a new student batch'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBatchSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="batchName">Batch Name *</Label>
                          <Input
                            id="batchName"
                            value={batchForm.batchName}
                            onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                            placeholder="e.g., 2024-25, Batch A, Spring 2024"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="academicYear">Academic Year *</Label>
                          <Input
                            id="academicYear"
                            value={batchForm.academicYear}
                            onChange={(e) => setBatchForm({ ...batchForm, academicYear: e.target.value })}
                            placeholder="e.g., 2024-25"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={batchForm.startDate}
                            onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={batchForm.endDate}
                            onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={batchForm.description}
                            onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                            placeholder="Optional description for this batch"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={batchForm.status} onValueChange={(value) => setBatchForm({ ...batchForm, status: value as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingBatch ? 'Update Batch' : 'Create Batch'}
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
                      placeholder="Search batches..."
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
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingBatches ? (
                  <div className="text-center py-8">Loading batches...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Code</TableHead>
                        <TableHead>Batch Name</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium font-mono">{batch.batchCode}</TableCell>
                          <TableCell>{batch.batchName}</TableCell>
                          <TableCell>{batch.academicYear}</TableCell>
                          <TableCell>{formatDate(batch.startDate)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{batch._count.students} students</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(batch.status)}</TableCell>
                          <TableCell>{batch.creator.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditBatch(batch)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)}>
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

        {/* Student Overview Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>View all students and their batch assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="text-center py-8">Loading students...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class.className}</TableCell>
                        <TableCell>
                          {student.batchId ? (
                            <Badge variant="outline">
                              {batches.find(b => b.id === student.batchId)?.batchName || 'Unknown'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No Batch</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Students to Batch</DialogTitle>
            <DialogDescription>
              Select a batch to assign {selectedStudents.length} selected students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchSelect">Select Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.filter(batch => batch.status === 'ACTIVE').map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batchName} - {batch.academicYear} ({batch._count.students} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStudents.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedStudents.length} students will be assigned to the selected batch.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStudents} disabled={!selectedBatch || selectedStudents.length === 0}>
              Assign Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassignment Dialog */}
      <Dialog open={isUnassignmentDialogOpen} onOpenChange={setIsUnassignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Students from Batch</DialogTitle>
            <DialogDescription>
              Remove {selectedStudents.length} selected students from their current batches
            </DialogDescription>
          </DialogHeader>
          {selectedStudents.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedStudents.length} students will be removed from their current batches.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUnassignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnassignStudents} disabled={selectedStudents.length === 0}>
              Remove from Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
