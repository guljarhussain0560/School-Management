'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload, Users,
  School, FileSpreadsheet, GraduationCap, Award, Calendar, BookOpen, X
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
  transportRequired?: boolean;
  status: string;
  class?: {
    id: string;
    className: string;
    classCode: string;
  };
  batch?: {
    id: string;
    batchName: string;
    academicYear: string;
  };
}

interface Class {
  id: string;
  className: string;
  classCode: string;
  _count?: {
    students: number;
  };
}

interface Batch {
  id: string;
  batchName: string;
  academicYear: string;
  status: string;
  _count?: {
    students: number;
  };
}

interface StudentManagementProps {
  activeSubSection?: string;
  setActiveSubSection?: (section: string) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ 
  activeSubSection = 'students',
  setActiveSubSection 
}) => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students');
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
      setIsLoading(false);
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
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
      toast.error('Error updating student');
    }
  };

  const handleReportAction = (reportType: string) => {
    toast.info(`Generating ${reportType}...`);
    // Implement report generation logic
  };

  // Form fields for student creation/editing
  const studentFields = [
    { name: 'name', label: 'Full Name', type: 'text' as const, required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email' as const, required: false, placeholder: 'Enter email address' },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: false, placeholder: 'Enter phone number' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' as const, required: false },
    { name: 'gender', label: 'Gender', type: 'select' as const, required: false, options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ]},
    { name: 'parentName', label: 'Parent/Guardian Name', type: 'text' as const, required: true, placeholder: 'Enter parent/guardian name' },
    { name: 'parentPhone', label: 'Parent Phone', type: 'text' as const, required: true, placeholder: 'Enter parent phone number' },
    { name: 'parentEmail', label: 'Parent Email', type: 'email' as const, required: false, placeholder: 'Enter parent email' },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: false, placeholder: 'Enter address' },
    { name: 'city', label: 'City', type: 'text' as const, required: false, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text' as const, required: false, placeholder: 'Enter state' },
    { name: 'pincode', label: 'Pincode', type: 'text' as const, required: false, placeholder: '123456' },
    { name: 'transportRequired', label: 'Transport Required', type: 'checkbox' as const, required: false },
    { name: 'medicalConditions', label: 'Medical Conditions', type: 'textarea' as const, required: false, placeholder: 'Any medical conditions...' },
    { name: 'allergies', label: 'Allergies', type: 'textarea' as const, required: false, placeholder: 'Any allergies...' },
    { name: 'previousSchool', label: 'Previous School', type: 'text' as const, required: false, placeholder: 'Previous school name' }
  ];

  const renderContent = () => {
    switch (activeSubSection) {
      case 'students':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Records</CardTitle>
                <CardDescription>View and manage all student records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="GRADUATED">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">Loading students...</div>
                  ) : (
                    <div className="grid gap-4">
                      {students.map((student) => (
                        <Card key={student.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold">{student.name}</h3>
                                <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                                <p className="text-sm text-gray-600">Class: {student.class?.classCode}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {student.status}
                              </Badge>
                              <Button size="sm" variant="outline" onClick={() => handleViewStudent(student)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditStudent(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'classes':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Management</CardTitle>
                <CardDescription>Manage classes and sections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{(cls.classCode || (cls as any).className || "N/A")}</h3>
                          <p className="text-sm text-gray-600">Code: {cls.classCode}</p>
                          <p className="text-sm text-gray-600">Students: {cls._count?.students || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'batches':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Management</CardTitle>
                <CardDescription>Manage student batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {batches.map((batch) => (
                    <Card key={batch.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{batch.batchName}</h3>
                          <p className="text-sm text-gray-600">Academic Year: {batch.academicYear}</p>
                          <p className="text-sm text-gray-600">Students: {batch._count?.students || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={batch.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {batch.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
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
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Records</CardTitle>
                <CardDescription>View and manage all student records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Select a section from the navigation to get started
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

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
              onSubmit={async (data) => {
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
                  toast.error('Error creating student');
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'students', name: 'Students', icon: Users },
            { id: 'classes', name: 'Classes', icon: School },
            { id: 'batches', name: 'Batches', icon: Users },
            { id: 'reports', name: 'Reports', icon: FileSpreadsheet }
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

      {/* Student Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View complete student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedStudent.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Student ID</Label>
                  <p className="text-sm">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedStudent.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedStudent.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Class</Label>
                  <p className="text-sm">{selectedStudent.class?.className || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={selectedStudent.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>
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
              title="Edit Student Details"
              fields={studentFields}
              templateKey="students"
              initialData={selectedStudent}
              onSubmit={handleUpdateStudent}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;