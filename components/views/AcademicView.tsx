'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Edit, Trash2, Save, X, Upload, Download, 
  FileText, Users, Calendar, BookOpen, BarChart3,
  CheckCircle, XCircle, Clock, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import TeacherAssignments from '@/components/admin/TeacherAssignments';

const AcademicView = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [curriculumProgress, setCurriculumProgress] = useState([]);
  
  // Form states
  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  
  // Performance form state
  const [performanceForm, setPerformanceForm] = useState({
    studentId: '',
    subject: '',
    grade: '',
    marks: '',
    maxMarks: '',
    examType: 'Quiz',
    examDate: '',
    remarks: ''
  });
  
  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    students: [] as any[]
  });
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    dueDate: '',
    totalMarks: ''
  });
  
  // Curriculum form state
  const [curriculumForm, setCurriculumForm] = useState({
    subject: '',
    grade: '',
    module: '',
    progress: ''
  });

  // Fetch data
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/academic/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/academic/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTeacherAssignments = async () => {
    try {
      const response = await fetch('/api/academic/teacher-assignments');
      if (response.ok) {
        const data = await response.json();
        setTeacherAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
    }
  };

  const fetchCurriculumProgress = async () => {
    try {
      const response = await fetch('/api/academic/curriculum-progress');
      if (response.ok) {
        const data = await response.json();
        setCurriculumProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Error fetching curriculum progress:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
    fetchTeacherAssignments();
    fetchCurriculumProgress();
  }, []);

  // Initialize attendance form with students
  useEffect(() => {
    if (students.length > 0) {
      setAttendanceForm(prev => ({
        ...prev,
        students: students.map((student: any) => ({
          id: student.id,
          name: student.name,
          present: true
        }))
      }));
    }
  }, [students]);

  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performanceForm)
      });

      if (response.ok) {
        toast.success('Student performance recorded successfully');
        setPerformanceForm({
          studentId: '', subject: '', grade: '', marks: '', maxMarks: '',
          examType: 'Quiz', examDate: '', remarks: ''
        });
        setShowPerformanceForm(false);
      } else {
        toast.error('Failed to record performance');
      }
    } catch (error) {
      toast.error('Error recording performance');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const attendanceData = attendanceForm.students.map(student => ({
        studentId: student.id,
        date: attendanceForm.date,
        status: student.present ? 'PRESENT' : 'ABSENT'
      }));

      const response = await fetch('/api/academic/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceData })
      });

      if (response.ok) {
        toast.success('Attendance recorded successfully');
        setShowAttendanceForm(false);
      } else {
        toast.error('Failed to record attendance');
      }
    } catch (error) {
      toast.error('Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm)
      });

      if (response.ok) {
        toast.success('Assignment created successfully');
        setAssignmentForm({
          title: '', description: '', subject: '', grade: '', dueDate: '', totalMarks: ''
        });
        setShowAssignmentForm(false);
        fetchAssignments();
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      toast.error('Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/curriculum-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curriculumForm)
      });

      if (response.ok) {
        toast.success('Curriculum progress updated successfully');
        setCurriculumForm({ subject: '', grade: '', module: '', progress: '' });
        setShowCurriculumForm(false);
        fetchCurriculumProgress();
      } else {
        toast.error('Failed to update curriculum progress');
      }
    } catch (error) {
      toast.error('Error updating curriculum progress');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcelTemplate = () => {
    // Create Excel template for bulk upload
    const templateData = [
      ['Student Name', 'Subject', 'Grade', 'Marks', 'Max Marks', 'Exam Type', 'Exam Date', 'Remarks'],
      ['John Doe', 'Mathematics', '10', '85', '100', 'Quiz', '2024-01-15', 'Good performance'],
      ['Jane Smith', 'Mathematics', '10', '92', '100', 'Quiz', '2024-01-15', 'Excellent work']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_performance_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle Excel/CSV file upload
      toast.info('File upload functionality will be implemented');
    }
  };

  const markAllPresent = () => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(student => ({ ...student, present: true }))
    }));
  };

  const presentCount = attendanceForm.students.filter(s => s.present).length;
  const totalStudents = attendanceForm.students.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Academic Management</h2>
          <p className="text-gray-600">Manage students, attendance, and assignments</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="teacher-assignments">Teacher Allocation</TabsTrigger>
        </TabsList>

        {/* Student Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Student Performance Upload
                  </CardTitle>
                  <CardDescription>Upload grades and assessments for students</CardDescription>
                </div>
                <Button onClick={() => setShowPerformanceForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Performance
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bulk Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bulk Upload Grades</h3>
                <p className="text-gray-600 mb-4">Upload CSV or Excel file with student grades</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={downloadExcelTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </label>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
              </div>

              {/* Individual Entry Form */}
              {showPerformanceForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Individual Entry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePerformanceSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="student">Student</Label>
                          <Select value={performanceForm.studentId} onValueChange={(value) => setPerformanceForm({...performanceForm, studentId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student: any) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} (Grade {student.grade})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select value={performanceForm.subject} onValueChange={(value) => setPerformanceForm({...performanceForm, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Geography">Geography</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="grade">Grade</Label>
                          <Select value={performanceForm.grade} onValueChange={(value) => setPerformanceForm({...performanceForm, grade: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                                <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="marks">Marks</Label>
                          <Input
                            id="marks"
                            type="number"
                            placeholder="0-100"
                            value={performanceForm.marks}
                            onChange={(e) => setPerformanceForm({...performanceForm, marks: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxMarks">Max Marks</Label>
                          <Input
                            id="maxMarks"
                            type="number"
                            value={performanceForm.maxMarks}
                            onChange={(e) => setPerformanceForm({...performanceForm, maxMarks: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="examType">Exam Type</Label>
                          <Select value={performanceForm.examType} onValueChange={(value) => setPerformanceForm({...performanceForm, examType: value})}>
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
                          <Label htmlFor="examDate">Exam Date</Label>
                          <Input
                            id="examDate"
                            type="date"
                            value={performanceForm.examDate}
                            onChange={(e) => setPerformanceForm({...performanceForm, examDate: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="remarks">Name</Label>
                          <Input
                            id="remarks"
                            placeholder="Optional feedback"
                            value={performanceForm.remarks}
                            onChange={(e) => setPerformanceForm({...performanceForm, remarks: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Performance
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowPerformanceForm(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Attendance Entry
                  </CardTitle>
                  <CardDescription>Mark student attendance for the selected date</CardDescription>
                </div>
                <Button onClick={() => setShowAttendanceForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAttendanceForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Record Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={attendanceForm.date}
                              onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
                              required
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm text-gray-600">
                              {new Date(attendanceForm.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={markAllPresent}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark All Present
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {attendanceForm.students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={student.present}
                                onCheckedChange={(checked) => {
                                  setAttendanceForm(prev => ({
                                    ...prev,
                                    students: prev.students.map(s => 
                                      s.id === student.id ? { ...s, present: checked as boolean } : s
                                    )
                                  }));
                                }}
                              />
                              <span className="font-medium">{student.name}</span>
                            </div>
                            <Badge variant={student.present ? "default" : "destructive"}>
                              {student.present ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Present: {presentCount}/{totalStudents}
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Attendance
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAttendanceForm(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Assignment Updates
                  </CardTitle>
                  <CardDescription>Update assignment status and upload graded files</CardDescription>
                </div>
                <Button onClick={() => setShowAssignmentForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignment Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="selectClass">Select Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="selectSubject">Select Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="selectAssignment">Select Assignment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((assignment: any) => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload Graded Files */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Graded Files</h3>
                <p className="text-gray-600 mb-4">Drag and drop graded assignments</p>
                <div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="graded-files-upload"
                  />
                  <Button asChild>
                    <label htmlFor="graded-files-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </label>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Accepted formats: .pdf, .doc, .docx</p>
              </div>

              {/* Assignment Form */}
              {showAssignmentForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Assignment Title</Label>
                          <Input
                            id="title"
                            value={assignmentForm.title}
                            onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select value={assignmentForm.subject} onValueChange={(value) => setAssignmentForm({...assignmentForm, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Geography">Geography</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="grade">Grade</Label>
                          <Select value={assignmentForm.grade} onValueChange={(value) => setAssignmentForm({...assignmentForm, grade: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                                <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={assignmentForm.dueDate}
                            onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalMarks">Total Marks</Label>
                          <Input
                            id="totalMarks"
                            type="number"
                            value={assignmentForm.totalMarks}
                            onChange={(e) => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={assignmentForm.description}
                            onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                            placeholder="Assignment description and instructions..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          Create Assignment
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAssignmentForm(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Progress Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Curriculum Progress
                  </CardTitle>
                  <CardDescription>Update module completion percentages</CardDescription>
                </div>
                <Button onClick={() => setShowCurriculumForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Display */}
              <div className="space-y-4">
                {curriculumProgress.map((progress: any, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{progress.module}</h4>
                      <span className="text-sm text-gray-600">{progress.progress}% complete</span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Progress Form */}
              {showCurriculumForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Curriculum Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCurriculumSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select value={curriculumForm.subject} onValueChange={(value) => setCurriculumForm({...curriculumForm, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Geography">Geography</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="grade">Grade</Label>
                          <Select value={curriculumForm.grade} onValueChange={(value) => setCurriculumForm({...curriculumForm, grade: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                                <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="module">Module</Label>
                          <Input
                            id="module"
                            value={curriculumForm.module}
                            onChange={(e) => setCurriculumForm({...curriculumForm, module: e.target.value})}
                            placeholder="e.g., Algebra, Geometry, Statistics"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="progress">Progress (%)</Label>
                          <Input
                            id="progress"
                            type="number"
                            min="0"
                            max="100"
                            value={curriculumForm.progress}
                            onChange={(e) => setCurriculumForm({...curriculumForm, progress: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          Update Progress
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowCurriculumForm(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Sync Progress to Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Assignments Tab */}
        <TabsContent value="teacher-assignments" className="space-y-4">
          <TeacherAssignments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicView;