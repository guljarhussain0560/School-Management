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
  ChevronLeft, ChevronRight, Filter, RefreshCw, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  grade: string;
  fee: number;
  status: string;
}

interface AdmissionApplication {
  id: number;
  name: string;
  grade: string;
  enrolledDate: string;
  status: string;
}

interface AcademicManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function AcademicManagementDashboard({ activeSubSection, setActiveSubSection }: AcademicManagementDashboardProps) {
  const [loading, setLoading] = useState(false);
  
  // Performance State
  const [performanceForm, setPerformanceForm] = useState({
    studentId: '',
    subject: '',
    grade: '',
    marks: '',
    maxMarks: '100',
    examType: '',
    examDate: '',
    remarks: ''
  });

  // Attendance State
  const [attendanceForm, setAttendanceForm] = useState({
    date: '',
    grade: '',
    subject: ''
  });

  // Assignment State
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    grade: '',
    dueDate: '',
    description: '',
    file: null as File | null
  });

  // Curriculum State
  const [curriculumForm, setCurriculumForm] = useState({
    subject: '',
    grade: '',
    module: '',
    progress: '0'
  });

  // Student Onboarding Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    age: '',
    grade: '',
    address: '',
    parentName: '',
    contactNumber: '',
    emailAddress: '',
    idProof: null as File | null
  });

  // Recent Admissions Data
  const [recentApplications, setRecentApplications] = useState<AdmissionApplication[]>([
    { id: 1, name: 'Emma Wilson', grade: 'Grade 5', enrolledDate: '2024-01-15', status: 'Pending' },
    { id: 2, name: 'Jack Brown', grade: 'Grade 3', enrolledDate: '2024-01-14', status: 'Approved' },
    { id: 3, name: 'Sophia Davis', grade: 'Grade 7', enrolledDate: '2024-01-13', status: 'Under Review' }
  ]);

  // Pagination and Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);

  // Performance Upload Handler
  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...performanceForm,
          marks: parseFloat(performanceForm.marks),
          maxMarks: parseFloat(performanceForm.maxMarks)
        })
      });

      if (response.ok) {
        toast.success('Performance record created successfully');
        setPerformanceForm({
          studentId: '', subject: '', grade: '', marks: '', maxMarks: '100', examType: '', examDate: '', remarks: ''
        });
      } else {
        toast.error('Failed to create performance record');
      }
    } catch (error) {
      toast.error('Error creating performance record');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload performance data');
      }
    } catch (error) {
      console.error('Error processing performance file:', error);
      toast.error('Error processing performance file');
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', studentForm.fullName);
      formData.append('age', studentForm.age);
      formData.append('grade', studentForm.grade);
      formData.append('address', studentForm.address);
      formData.append('parentName', studentForm.parentName);
      formData.append('contactNumber', studentForm.contactNumber);
      formData.append('emailAddress', studentForm.emailAddress);
      if (studentForm.idProof) {
        formData.append('idProof', studentForm.idProof);
      }

      const response = await fetch('/api/academic/students', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Student enrolled successfully');
        setStudentForm({
          fullName: '', age: '', grade: '', address: '', parentName: '', contactNumber: '', emailAddress: '', idProof: null
        });
        
        // Add to recent applications
        const newApplication = {
          id: Date.now(),
          name: studentForm.fullName,
          grade: studentForm.grade,
          enrolledDate: new Date().toISOString().split('T')[0],
          status: 'Pending'
        };
        setRecentApplications(prev => [newApplication, ...prev]);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to enroll student');
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast.error('Error enrolling student');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentBatchUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/academic/students/bulk', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        // Add sample applications to recent list
        const newApplications = result.students?.map((student: any, index: number) => ({
          id: Date.now() + index,
          name: student.fullName || student.name,
          grade: student.grade,
          enrolledDate: new Date().toISOString().split('T')[0],
          status: 'Pending'
        })) || [];
        
        setRecentApplications(prev => [...newApplications, ...prev]);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload student data');
      }
    } catch (error) {
      console.error('Error processing student batch file:', error);
      toast.error('Error processing student batch file');
    }
  };

  const downloadStudentTemplate = () => {
    const templateData = [
      ['Full Name', 'Age', 'Grade', 'Address', 'Parent Name', 'Contact Number', 'Email Address'],
      ['John Doe', '10', 'Grade 5', '123 Main St', 'Jane Doe', '+1234567890', 'john@example.com'],
      ['Jane Smith', '11', 'Grade 6', '456 Oak Ave', 'Bob Smith', '+0987654321', 'jane@example.com']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Template');
    XLSX.writeFile(wb, 'student_admission_template.csv');
  };

  const fetchRecentAdmissions = async (page = 1, search = '', field = 'name', status = 'all') => {
    setIsLoadingAdmissions(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        field: field,
        status: status
      });
      
      const response = await fetch(`/api/academic/recent-admissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecentApplications(data.admissions);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching recent admissions:', error);
      toast.error('Failed to fetch recent admissions');
    } finally {
      setIsLoadingAdmissions(false);
    }
  };

  const handleSearch = () => {
    fetchRecentAdmissions(1, searchTerm, searchField, statusFilter);
  };

  const handlePageChange = (page: number) => {
    fetchRecentAdmissions(page, searchTerm, searchField, statusFilter);
  };

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    setRecentApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    toast.success(`Application status updated to ${newStatus}`);
  };

  useEffect(() => {
    fetchRecentAdmissions();
  }, []);

  const renderContent = () => {
    switch (activeSubSection) {
      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
              <p className="text-gray-600">Track and manage student academic performance</p>
            </div>

            {/* Bulk Upload Grades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Bulk Upload Grades
                </CardTitle>
                <CardDescription>
                  Upload CSV or Excel file with student performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Upload Grades</h3>
                  <p className="text-gray-600 mb-4">Upload CSV or Excel file with student performance records</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadStudentTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                        id="performance-upload"
                      />
                      <Button asChild>
                        <label htmlFor="performance-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
              </CardContent>
            </Card>

            {/* Individual Performance Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Individual Performance Entry
                </CardTitle>
                <CardDescription>
                  Add performance record for individual students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePerformanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        placeholder="Enter student ID"
                        value={performanceForm.studentId}
                        onChange={(e) => setPerformanceForm({...performanceForm, studentId: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter subject"
                        value={performanceForm.subject}
                        onChange={(e) => setPerformanceForm({...performanceForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        placeholder="Enter grade"
                        value={performanceForm.grade}
                        onChange={(e) => setPerformanceForm({...performanceForm, grade: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="examType">Exam Type</Label>
                      <Select
                        value={performanceForm.examType}
                        onValueChange={(value) => setPerformanceForm({...performanceForm, examType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                          <SelectItem value="Test">Test</SelectItem>
                          <SelectItem value="Exam">Exam</SelectItem>
                          <SelectItem value="Assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="marks">Marks Obtained</Label>
                      <Input
                        id="marks"
                        type="number"
                        placeholder="Enter marks"
                        value={performanceForm.marks}
                        onChange={(e) => setPerformanceForm({...performanceForm, marks: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxMarks">Maximum Marks</Label>
                      <Input
                        id="maxMarks"
                        type="number"
                        placeholder="Enter max marks"
                        value={performanceForm.maxMarks}
                        onChange={(e) => setPerformanceForm({...performanceForm, maxMarks: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="examDate">Exam Date</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={performanceForm.examDate}
                        onChange={(e) => setPerformanceForm({...performanceForm, examDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Enter any remarks"
                      value={performanceForm.remarks}
                      onChange={(e) => setPerformanceForm({...performanceForm, remarks: e.target.value})}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Performance Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
              <p className="text-gray-600">Manage student attendance records</p>
            </div>

            {/* Bulk Upload Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Bulk Upload Attendance
                </CardTitle>
                <CardDescription>
                  Upload CSV or Excel file with student attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Upload Attendance</h3>
                  <p className="text-gray-600 mb-4">Upload CSV or Excel file with student attendance records</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
              </CardContent>
            </Card>

            {/* Individual Attendance Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Attendance Entry</CardTitle>
                <CardDescription>Record attendance for individual students</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        placeholder="dd----yyyy"
                        value={attendanceForm.date}
                        onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={attendanceForm.grade}
                        onValueChange={(value) => setAttendanceForm({...attendanceForm, grade: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={attendanceForm.subject}
                        onValueChange={(value) => setAttendanceForm({...attendanceForm, subject: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Social Studies">Social Studies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button>Record Attendance</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
              <p className="text-gray-600">Create and manage student assignments</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter assignment title"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter subject"
                        value={assignmentForm.subject}
                        onChange={(e) => setAssignmentForm({...assignmentForm, subject: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        placeholder="Enter grade"
                        value={assignmentForm.grade}
                        onChange={(e) => setAssignmentForm({...assignmentForm, grade: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter assignment description"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file">Assignment File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setAssignmentForm({...assignmentForm, file: e.target.files?.[0] || null})}
                    />
                  </div>
                  <Button>Create Assignment</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'curriculum':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Curriculum Management</h2>
              <p className="text-gray-600">Track curriculum progress and coverage</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Update Curriculum Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter subject"
                        value={curriculumForm.subject}
                        onChange={(e) => setCurriculumForm({...curriculumForm, subject: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        placeholder="Enter grade"
                        value={curriculumForm.grade}
                        onChange={(e) => setCurriculumForm({...curriculumForm, grade: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="module">Module</Label>
                      <Input
                        id="module"
                        placeholder="Enter module name"
                        value={curriculumForm.module}
                        onChange={(e) => setCurriculumForm({...curriculumForm, module: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter progress percentage"
                        value={curriculumForm.progress}
                        onChange={(e) => setCurriculumForm({...curriculumForm, progress: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button>Update Progress</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'student-onboarding':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Onboarding</h2>
              <p className="text-gray-600">Enroll new students and manage admissions</p>
            </div>

            {/* Student Onboarding Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Student Onboarding Form
                </CardTitle>
                <CardDescription>
                  Complete form to enroll a new student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter student's full name"
                        value={studentForm.fullName}
                        onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter age"
                        value={studentForm.age}
                        onChange={(e) => setStudentForm({...studentForm, age: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade *</Label>
                      <Select
                        value={studentForm.grade}
                        onValueChange={(value) => setStudentForm({...studentForm, grade: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Home address"
                        value={studentForm.address}
                        onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Required for student records and emergency contact</p>
                    </div>
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input
                        id="parentName"
                        placeholder="Enter parent/guardian name"
                        value={studentForm.parentName}
                        onChange={(e) => setStudentForm({...studentForm, parentName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        placeholder="Enter contact number"
                        value={studentForm.contactNumber}
                        onChange={(e) => setStudentForm({...studentForm, contactNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailAddress">Email Address *</Label>
                      <Input
                        id="emailAddress"
                        type="email"
                        placeholder="Email address for parent communication"
                        value={studentForm.emailAddress}
                        onChange={(e) => setStudentForm({...studentForm, emailAddress: e.target.value})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Required for sending important information to parents</p>
                    </div>
                    <div>
                      <Label htmlFor="idProof">ID Proof Document</Label>
                      <Input
                        id="idProof"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setStudentForm({...studentForm, idProof: e.target.files?.[0] || null})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload birth certificate or other ID proof</p>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Enrolling...' : 'Enroll Student'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Batch Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Batch Upload
                </CardTitle>
                <CardDescription>
                  Upload multiple students using CSV or Excel file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Upload Students</h3>
                  <p className="text-gray-600 mb-4">Upload CSV or Excel file with student information</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadStudentTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleStudentBatchUpload}
                        className="hidden"
                        id="student-batch-upload"
                      />
                      <Button asChild>
                        <label htmlFor="student-batch-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Full Name, Age, Grade, Address</li>
                    <li>• Parent Name, Contact Number, Email Address</li>
                  </ul>
                  <h4 className="font-medium text-blue-900 mb-2 mt-3">Optional Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• ID Proof (file path or URL)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'batch-upload':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Batch Upload</h2>
              <p className="text-gray-600">Upload multiple students using CSV or Excel file</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Student Batch Upload
                </CardTitle>
                <CardDescription>
                  Upload CSV or Excel file with student information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Upload Students</h3>
                  <p className="text-gray-600 mb-4">Upload CSV or Excel file with student information</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadStudentTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleStudentBatchUpload}
                        className="hidden"
                        id="batch-upload-file"
                      />
                      <Button asChild>
                        <label htmlFor="batch-upload-file" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Full Name, Age, Grade, Address</li>
                    <li>• Parent Name, Contact Number, Email Address</li>
                  </ul>
                  <h4 className="font-medium text-blue-900 mb-2 mt-3">Optional Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• ID Proof (file path or URL)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'recent-admissions':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Admissions</h2>
                <p className="text-gray-600">View and manage recently enrolled students</p>
              </div>
              <Button variant="outline" onClick={() => fetchRecentAdmissions(currentPage, searchTerm, searchField, statusFilter)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="searchField">Search Field</Label>
                    <Select value={searchField} onValueChange={setSearchField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="grade">Grade</SelectItem>
                        <SelectItem value="enrolledDate">Enrolled Date</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="searchTerm">Search Term</Label>
                    <Input
                      id="searchTerm"
                      placeholder="Enter search term"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="statusFilter">Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admissions List */}
            <Card>
              <CardHeader>
                <CardTitle>Admissions List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAdmissions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading admissions...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{application.name}</p>
                            <p className="text-sm text-gray-500">Grade: {application.grade}</p>
                            <p className="text-sm text-gray-500">Enrolled: {application.enrolledDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              application.status === 'Approved' ? 'default' : 
                              application.status === 'Pending' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {application.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.status === 'Pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(application.id, 'Approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {application.status === 'Approved' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(application.id, 'Pending')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                            {application.status === 'Under Review' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(application.id, 'Approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admission Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentApplications.filter(app => app.status === 'Approved').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentApplications.filter(app => app.status === 'Pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Under Review</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {recentApplications.filter(app => app.status === 'Under Review').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Academic Management</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
