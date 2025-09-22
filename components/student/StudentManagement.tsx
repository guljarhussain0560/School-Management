'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload,
  Users, School, UserCheck, FileSpreadsheet, Calendar, Phone, Mail,
  MapPin, GraduationCap, BookOpen, Award, AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';

interface Student {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalConditions?: string;
  allergies?: string;
  previousSchool?: string;
  transportRequired: boolean;
  status: string;
  class: {
    id: string;
    className: string;
    classCode: string;
  };
  batch?: {
    id: string;
    batchName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Class {
  id: string;
  className: string;
  classCode: string;
}

interface StudentBatch {
  id: string;
  batchName: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  _count: {
    students: number;
  };
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/academic/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/academic/student-batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleCreateStudent = async (data: any) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Student created successfully');
        setShowCreateDialog(false);
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to create student');
    }
  };

  const handleBulkCreateStudents = async (data: any[]) => {
    try {
      const response = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: data })
      });

      if (response.ok) {
        toast.success(`${data.length} students created successfully`);
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create students');
      }
    } catch (error) {
      console.error('Error creating students:', error);
      toast.error('Failed to create students');
    }
  };

  const handleUpdateStudent = async (data: any) => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Student updated successfully');
        setShowEditDialog(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Student deleted successfully');
        fetchStudents();
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleReportAction = (reportType: string) => {
    switch (reportType) {
      case 'Student Directory':
        toast.info('Generating student directory report...');
        break;
      case 'Class-wise Report':
        toast.info('Generating class-wise report...');
        break;
      case 'Batch-wise Report':
        toast.info('Generating batch-wise report...');
        break;
      case 'Performance Report':
        toast.info('Generating performance report...');
        break;
      case 'Attendance Report':
        toast.info('Generating attendance report...');
        break;
      case 'Academic Report':
        toast.info('Generating academic report...');
        break;
      default:
        toast.info(`${reportType} feature coming soon`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'GRADUATED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.class.id === filterClass;
    const matchesBatch = filterBatch === 'all' || student.batch?.id === filterBatch;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesBatch && matchesStatus;
  });

  const studentFields = [
    { name: 'name', label: 'Student Name', type: 'text' as const, required: true, placeholder: 'Enter student name' },
    { name: 'email', label: 'Email', type: 'email' as const, required: false, placeholder: 'student@example.com' },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: false, placeholder: '9876543210' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' as const, required: false },
    { name: 'gender', label: 'Gender', type: 'select' as const, required: false,
      options: [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' }
      ]
    },
    { name: 'classId', label: 'Class', type: 'select' as const, required: true,
      options: classes.map(c => ({ value: c.id, label: c.className }))
    },
    { name: 'batchId', label: 'Batch', type: 'select' as const, required: false,
      options: batches.map(b => ({ value: b.id, label: b.batchName }))
    },
    { name: 'parentName', label: 'Parent Name', type: 'text' as const, required: true, placeholder: 'Enter parent name' },
    { name: 'parentPhone', label: 'Parent Phone', type: 'text' as const, required: true, placeholder: '9876543210' },
    { name: 'parentEmail', label: 'Parent Email', type: 'email' as const, required: false, placeholder: 'parent@example.com' },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: false, placeholder: 'Enter address' },
    { name: 'city', label: 'City', type: 'text' as const, required: false, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text' as const, required: false, placeholder: 'Enter state' },
    { name: 'pincode', label: 'Pincode', type: 'text' as const, required: false, placeholder: '123456' },
    { name: 'transportRequired', label: 'Transport Required', type: 'checkbox' as const, required: false },
    { name: 'medicalConditions', label: 'Medical Conditions', type: 'textarea' as const, required: false, placeholder: 'Any medical conditions...' },
    { name: 'allergies', label: 'Allergies', type: 'textarea' as const, required: false, placeholder: 'Any allergies...' },
    { name: 'previousSchool', label: 'Previous School', type: 'text' as const, required: false, placeholder: 'Previous school name' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage student records, classes, and batches</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Register a new student with all necessary details
              </DialogDescription>
            </DialogHeader>
            <FormWithExcel
              title="Student Details"
              fields={studentFields}
              templateKey="students"
              onSubmit={handleCreateStudent}
              onBulkSubmit={handleBulkCreateStudents}
              submitButtonText="Add Student"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
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
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label htmlFor="class-filter">Class</Label>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map(classItem => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[150px]">
                  <Label htmlFor="batch-filter">Batch</Label>
                  <Select value={filterBatch} onValueChange={setFilterBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="GRADUATED">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Students ({filteredStudents.length})</CardTitle>
                  <CardDescription>All registered students</CardDescription>
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
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            {student.email && (
                              <div className="text-sm text-gray-500">{student.email}</div>
                            )}
                          </div>
                        </TableCell>
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
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{student.parentName}</div>
                            {student.parentEmail && (
                              <div className="text-sm text-gray-500">{student.parentEmail}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {student.parentPhone && <div>{student.parentPhone}</div>}
                            {student.phone && <div className="text-gray-500">{student.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowEditDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
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
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>Manage academic classes and sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(classItem => (
                  <div key={classItem.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{classItem.className}</h3>
                      <Badge variant="outline">{classItem.classCode}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Students: {students.filter(s => s.class.id === classItem.id).length}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>Manage student batches and groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map(batch => (
                  <div key={batch.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{batch.batchName}</h3>
                      <Badge variant={batch.isActive ? "default" : "secondary"}>
                        {batch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {batch.description && (
                      <p className="text-sm text-gray-600 mb-2">{batch.description}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Students: {batch._count.students}
                    </p>
                    <p className="text-sm text-gray-500">
                      Start: {new Date(batch.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Reports</CardTitle>
              <CardDescription>Generate comprehensive student reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Student Directory')}>
                  <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold mb-1">Student Directory</h3>
                  <p className="text-sm text-gray-600">Complete student contact information</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Class-wise Report')}>
                  <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold mb-1">Class-wise Report</h3>
                  <p className="text-sm text-gray-600">Students grouped by class</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Batch-wise Report')}>
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Batch-wise Report</h3>
                  <p className="text-sm text-gray-600">Students grouped by batch</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Performance Report')}>
                  <Award className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-semibold mb-1">Performance Report</h3>
                  <p className="text-sm text-gray-600">Academic performance summary</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Attendance Report')}>
                  <Calendar className="h-8 w-8 text-red-600 mb-2" />
                  <h3 className="font-semibold mb-1">Attendance Report</h3>
                  <p className="text-sm text-gray-600">Attendance statistics</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleReportAction('Academic Report')}>
                  <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
                  <h3 className="font-semibold mb-1">Academic Report</h3>
                  <p className="text-sm text-gray-600">Comprehensive academic data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent && !showEditDialog} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Student ID</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.gender || 'Not provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Class</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.class.className}</p>
                  </div>
                  <div>
                    <Label>Batch</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.batch?.batchName || 'No batch assigned'}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Transport Required</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.transportRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <Label>Registration Date</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedStudent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Parent Name</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.parentName}</p>
                  </div>
                  <div>
                    <Label>Parent Phone</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.parentPhone}</p>
                  </div>
                  <div>
                    <Label>Parent Email</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.parentEmail || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {selectedStudent.address && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <div>
                    <Label>Address</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>State</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.pincode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedStudent.medicalConditions || selectedStudent.allergies) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medical Information</h3>
                  {selectedStudent.medicalConditions && (
                    <div>
                      <Label>Medical Conditions</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.medicalConditions}</p>
                    </div>
                  )}
                  {selectedStudent.allergies && (
                    <div>
                      <Label>Allergies</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.allergies}</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowEditDialog(true);
                  setSelectedStudent(null);
                }}>
                  Edit Student
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <FormWithExcel
              title="Student Details"
              fields={studentFields}
              templateKey="students"
              onSubmit={handleUpdateStudent}
              initialData={{
                name: selectedStudent.name,
                email: selectedStudent.email || '',
                phone: selectedStudent.phone || '',
                dateOfBirth: selectedStudent.dateOfBirth || '',
                gender: selectedStudent.gender || '',
                classId: selectedStudent.class.id,
                batchId: selectedStudent.batch?.id || '',
                parentName: selectedStudent.parentName || '',
                parentPhone: selectedStudent.parentPhone || '',
                parentEmail: selectedStudent.parentEmail || '',
                address: selectedStudent.address || '',
                city: selectedStudent.city || '',
                state: selectedStudent.state || '',
                pincode: selectedStudent.pincode || '',
                transportRequired: selectedStudent.transportRequired,
                medicalConditions: selectedStudent.medicalConditions || '',
                allergies: selectedStudent.allergies || '',
                previousSchool: selectedStudent.previousSchool || ''
              }}
              submitButtonText="Update Student"
              showExcelFeatures={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
