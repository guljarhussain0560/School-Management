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
  BarChart3, FileSpreadsheet, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import ValidatedForm from '../common/ValidatedForm';

interface StudentBatch {
  id: string;
  batchName: string;
  batchCode: string;
  academicYear: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
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
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  class: {
    id: string;
    className: string;
    classCode: string;
  };
  batch?: {
    id: string;
    batchName: string;
  };
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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StudentBatch | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBatches();
    fetchStudents();
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

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateBatch = async (data: any) => {
    try {
      const response = await fetch('/api/academic/student-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Batch created successfully');
        setShowCreateDialog(false);
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

  const handleUpdateBatch = async (data: any) => {
    if (!selectedBatch) return;

    try {
      const response = await fetch(`/api/academic/student-batches/${selectedBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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

  const handleAssignStudents = async (studentIds: string[]) => {
    if (!selectedBatch) return;

    try {
      const response = await fetch('/api/academic/student-batches/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          studentIds
        })
      });

      if (response.ok) {
        toast.success(`${studentIds.length} students assigned to batch successfully`);
        setShowAssignDialog(false);
        setSelectedBatch(null);
        fetchBatches();
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign students');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('Failed to assign students');
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

  const batchFields = [
    { name: 'batchName', label: 'Batch Name', type: 'text' as const, required: true, placeholder: 'e.g., Class of 2024' },
    { name: 'batchCode', label: 'Batch Code', type: 'text' as const, required: true, placeholder: 'e.g., B2024' },
    { name: 'academicYear', label: 'Academic Year', type: 'text' as const, required: true, placeholder: 'e.g., 2024-25' },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: false, placeholder: 'Batch description...' },
    { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
    { name: 'endDate', label: 'End Date', type: 'date' as const, required: false },
    { name: 'status', label: 'Status', type: 'select' as const, required: true,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'COMPLETED', label: 'Completed' }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSubSection) {
      case 'batch-overview':
        return renderBatchOverview();
      case 'create-batch':
        return renderCreateBatch();
      case 'assign-students':
        return renderAssignStudents();
      case 'batch-reports':
        return renderBatchReports();
      default:
        return renderBatchOverview();
    }
  };

  const renderBatchOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Batch Overview</h2>
          <p className="text-gray-600">View and manage all student batches</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setActiveSubSection?.('create-batch')}
        >
          <Plus className="h-4 w-4" />
          Create Batch
        </Button>
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
                  placeholder="Search batches..."
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
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Batches ({filteredBatches.length})</CardTitle>
              <CardDescription>All student batches</CardDescription>
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
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{batch.batchName}</div>
                        <div className="text-sm text-gray-500">{batch.batchCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{batch.academicYear}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(batch.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{batch._count.students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowStudentsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowAssignDialog(true);
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBatch(batch.id)}
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

      {/* Batch Details Dialog */}
      <Dialog open={!!selectedBatch && !showEditDialog && !showAssignDialog} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
            <DialogDescription>
              Information for {selectedBatch?.batchName}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Batch Name</Label>
                    <p className="text-sm text-gray-600">{selectedBatch.batchName}</p>
                  </div>
                  <div>
                    <Label>Batch Code</Label>
                    <p className="text-sm text-gray-600">{selectedBatch.batchCode}</p>
                  </div>
                  <div>
                    <Label>Academic Year</Label>
                    <p className="text-sm text-gray-600">{selectedBatch.academicYear}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedBatch.status)}>
                      {selectedBatch.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Start Date</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBatch.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="text-sm text-gray-600">
                      {selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label>Total Students</Label>
                    <p className="text-sm text-gray-600">{selectedBatch._count.students}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBatch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBatch.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedBatch.description}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBatch(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowEditDialog(true);
                  setSelectedBatch(null);
                }}>
                  Edit Batch
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch information
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <ValidatedForm
              fields={batchFields}
              initialData={{
                batchName: selectedBatch.batchName,
                batchCode: selectedBatch.batchCode,
                academicYear: selectedBatch.academicYear,
                description: selectedBatch.description || '',
                startDate: selectedBatch.startDate,
                endDate: selectedBatch.endDate || '',
                status: selectedBatch.status
              }}
              onSubmit={handleUpdateBatch}
              submitText="Update Batch"
              className="space-y-4"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Students to Batch</DialogTitle>
            <DialogDescription>
              Select students to assign to {selectedBatch?.batchName}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Students without a batch assignment will be shown below. Select students to assign to this batch.
                </AlertDescription>
              </Alert>
              
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Current Batch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            className="rounded border-gray-300"
                            aria-label={`Select student ${student.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.class.className}</Badge>
                        </TableCell>
                        <TableCell>
                          {student.batch ? (
                            <Badge variant="secondary">{student.batch.batchName}</Badge>
                          ) : (
                            <span className="text-gray-400">No batch</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Get selected students
                  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                  const selectedStudentIds = Array.from(checkboxes).map(cb => 
                    (cb as HTMLInputElement).id.replace('student-', '')
                  );
                  handleAssignStudents(selectedStudentIds);
                }}>
                  Assign Selected Students
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderCreateBatch = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Create New Batch</h2>
          <p className="text-gray-600">Create a new student batch for an academic year</p>
        </div>
        <Button variant="outline" onClick={() => setActiveSubSection?.('batch-overview')}>
          Back to Overview
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
          <CardDescription>Fill in the details for the new batch</CardDescription>
        </CardHeader>
        <CardContent>
          <ValidatedForm
            fields={batchFields}
            onSubmit={handleCreateBatch}
            submitText="Create Batch"
            className="space-y-4"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderAssignStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Assign Students to Batches</h2>
          <p className="text-gray-600">Assign students to appropriate batches</p>
        </div>
        <Button variant="outline" onClick={() => setActiveSubSection?.('batch-overview')}>
          Back to Overview
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Batch and Students</CardTitle>
          <CardDescription>Choose a batch and assign students to it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-select">Select Batch</Label>
              <Select onValueChange={(value) => {
                const batch = batches.find(b => b.id === value);
                setSelectedBatch(batch || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedBatch && (
              <div>
                <Button onClick={() => setShowAssignDialog(true)}>
                  Assign Students to {selectedBatch.batchName}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBatchReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Batch Reports</h2>
          <p className="text-gray-600">Generate comprehensive batch reports</p>
        </div>
        <Button variant="outline" onClick={() => setActiveSubSection?.('batch-overview')}>
          Back to Overview
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Batch Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Overview of all batches and student counts</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Student Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Students distributed across batches</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Academic Year Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Batch progression over academic years</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'batch-overview', name: 'Overview', icon: BarChart3 },
            { id: 'create-batch', name: 'Create Batch', icon: Plus },
            { id: 'assign-students', name: 'Assign Students', icon: UserCheck },
            { id: 'batch-reports', name: 'Reports', icon: FileSpreadsheet }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection?.(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeSubSection === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Render Content */}
      {renderContent()}
    </div>
  );
};

export default BatchManagement;
