'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CalendarDays, BookOpen, GraduationCap, Users, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface StudentBatch {
  id: string;
  batchName: string;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Class {
  id: string;
  className: string;
  classCode: string; // Generated class code
  description?: string;
  capacity: number;
  isActive: boolean;
  batch: {
    id: string;
    batchCode: string; // Generated batch code
    batchName: string;
    academicYear: string;
  };
  _count: {
    students: number;
    subjects: number;
  };
}

interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  description?: string;
  isActive: boolean;
  _count: {
    classGrades: number;
  };
}

interface SubjectGrade {
  id: string;
  subject: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
  class: {
    id: string;
    className: string;
    classCode: string;
    batch: {
      batchName: string;
      academicYear: string;
    };
  };
}

interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'MEETING' | 'DEADLINE' | 'OTHER';
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  location?: string;
  isActive: boolean;
}

interface Exam {
  id: string;
  examName: string;
  examType: 'QUIZ' | 'TEST' | 'MID_TERM' | 'FINAL' | 'ASSIGNMENT' | 'PROJECT' | 'PRACTICAL' | 'ORAL';
  subject: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
  class: {
    id: string;
    className: string;
    classCode: string;
    batch: {
      batchName: string;
      academicYear: string;
    };
  };
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions?: string;
  isActive: boolean;
  _count: {
    results: number;
    schedules: number;
  };
}

interface ExamResult {
  id: string;
  exam: {
    id: string;
    examName: string;
    examType: string;
    totalMarks: number;
    passingMarks: number;
    subject: {
      subjectName: string;
      subjectCode: string;
    };
    class: {
      className: string;
      classCode: string;
    };
  };
  student: {
    id: string;
    studentId: string;
    name: string;
    rollNumber: string;
  };
  marksObtained: number;
  grade?: string;
  remarks?: string;
  isPassed: boolean;
}

const AcademicManagement: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('classes');
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectGrades, setSubjectGrades] = useState<SubjectGrade[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [classForm, setClassForm] = useState({
    className: '',
    level: 0,
    section: '',
    description: '',
    capacity: 30,
    batchId: ''
  });
  
  const [subjectForm, setSubjectForm] = useState({
    subjectName: '',
    category: '',
    level: 0,
    description: ''
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'EVENT' as const,
    startDate: '',
    endDate: '',
    isAllDay: false,
    location: ''
  });
  
  const [examForm, setExamForm] = useState({
    examName: '',
    examType: 'QUIZ' as const,
    subjectId: '',
    classId: '',
    totalMarks: '',
    passingMarks: '',
    duration: '',
    instructions: ''
  });
  
  const [resultForm, setResultForm] = useState({
    examId: '',
    studentId: '',
    marksObtained: '',
    grade: '',
    remarks: ''
  });
  
  // Filters
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data functions
  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/academic/student-batches');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    }
  };

  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== 'all') params.append('batchId', selectedBatch);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/academic/classes?${params}`);
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects');
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchSubjectGrades = async () => {
    try {
      const response = await fetch('/api/academic/subject-grades');
      const data = await response.json();
      setSubjectGrades(data.subjectGrades || []);
    } catch (error) {
      console.error('Error fetching subject grades:', error);
      toast.error('Failed to fetch subject grades');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/academic/calendar');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/academic/exams');
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    }
  };

  const fetchExamResults = async () => {
    try {
      const response = await fetch('/api/academic/exam-results');
      const data = await response.json();
      setExamResults(data.results || []);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('Failed to fetch exam results');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchClasses();
    } else if (activeTab === 'subjects') {
      fetchSubjects();
      fetchSubjectGrades();
    } else if (activeTab === 'calendar') {
      fetchEvents();
    } else if (activeTab === 'exams') {
      fetchExams();
    } else if (activeTab === 'results') {
      fetchExamResults();
    }
  }, [activeTab, selectedBatch, searchTerm]);

  // Form submission handlers
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Class created successfully');
        setClassForm({ className: '', level: 0, section: '', description: '', capacity: 30, batchId: '' });
        setDialogOpen(false);
        fetchClasses();
      } else {
        toast.error(data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subject created successfully');
        setSubjectForm({ subjectName: '', category: '', level: 0, description: '' });
        setDialogOpen(false);
        fetchSubjects();
      } else {
        toast.error(data.error || 'Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Event created successfully');
        setEventForm({ title: '', description: '', eventType: 'EVENT', startDate: '', endDate: '', isAllDay: false, location: '' });
        setDialogOpen(false);
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Exam created successfully');
        setExamForm({ examName: '', examType: 'QUIZ', subjectId: '', classId: '', totalMarks: '', passingMarks: '', duration: '', instructions: '' });
        setDialogOpen(false);
        fetchExams();
      } else {
        toast.error(data.error || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectGradeAssign = async (subjectId: string, classId: string) => {
    try {
      const response = await fetch('/api/academic/subject-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, classId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subject assigned to class successfully');
        fetchSubjectGrades();
      } else {
        toast.error(data.error || 'Failed to assign subject');
      }
    } catch (error) {
      console.error('Error assigning subject:', error);
      toast.error('Failed to assign subject');
    }
  };

  const handleSubjectGradeRemove = async (subjectId: string, classId: string) => {
    try {
      const response = await fetch(`/api/academic/subject-grades?subjectId=${subjectId}&classId=${classId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subject assignment removed successfully');
        fetchSubjectGrades();
      } else {
        toast.error(data.error || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  // Helper functions
  const getEventTypeBadge = (type: string) => {
    const colors = {
      HOLIDAY: 'bg-red-100 text-red-800',
      EXAM: 'bg-blue-100 text-blue-800',
      EVENT: 'bg-green-100 text-green-800',
      MEETING: 'bg-purple-100 text-purple-800',
      DEADLINE: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || colors.OTHER}>{type}</Badge>;
  };

  const getExamTypeBadge = (type: string) => {
    const colors = {
      QUIZ: 'bg-blue-100 text-blue-800',
      TEST: 'bg-green-100 text-green-800',
      MID_TERM: 'bg-orange-100 text-orange-800',
      FINAL: 'bg-red-100 text-red-800',
      ASSIGNMENT: 'bg-purple-100 text-purple-800',
      PROJECT: 'bg-indigo-100 text-indigo-800',
      PRACTICAL: 'bg-pink-100 text-pink-800',
      ORAL: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || colors.QUIZ}>{type}</Badge>;
  };

  const getGradeBadge = (grade: string, isPassed: boolean) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[grade as keyof typeof colors] || (isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>{grade || (isPassed ? 'PASS' : 'FAIL')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Management</h2>
          <p className="text-muted-foreground">
            Manage classes, subjects, calendar events, and exams
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classes</CardTitle>
                  <CardDescription>
                    Manage classes and their assignments to batches
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Class</DialogTitle>
                      <DialogDescription>
                        Add a new class to the system
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleClassSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="className">Class Name</Label>
                        <Input
                          id="className"
                          value={classForm.className}
                          onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                          placeholder="e.g., Class 5, Grade 10"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="level">Level</Label>
                          <Input
                            id="level"
                            type="number"
                            value={classForm.level}
                            onChange={(e) => setClassForm({ ...classForm, level: parseInt(e.target.value) })}
                            placeholder="e.g., 5, 10"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={classForm.section}
                            onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                            placeholder="e.g., A, B, C"
                            maxLength={1}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="batchId">Batch</Label>
                        <Select value={classForm.batchId} onValueChange={(value) => setClassForm({ ...classForm, batchId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.batchName} ({batch.academicYear})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) })}
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={classForm.description}
                          onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Class'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Class Code</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.className}</TableCell>
                      <TableCell>{classItem.classCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{classItem.batch.batchName}</div>
                          <div className="text-sm text-muted-foreground">{classItem.batch.academicYear}</div>
                        </div>
                      </TableCell>
                      <TableCell>{classItem.capacity}</TableCell>
                      <TableCell>{classItem._count.students}</TableCell>
                      <TableCell>{classItem._count.subjects}</TableCell>
                      <TableCell>
                        <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                          {classItem.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjects List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subjects</CardTitle>
                    <CardDescription>
                      Manage subjects in the system
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Subject</DialogTitle>
                        <DialogDescription>
                          Add a new subject to the system
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubjectSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="subjectName">Subject Name</Label>
                          <Input
                            id="subjectName"
                            value={subjectForm.subjectName}
                            onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                            placeholder="e.g., Mathematics, English"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={subjectForm.category} onValueChange={(value) => setSubjectForm({ ...subjectForm, category: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CORE">Core</SelectItem>
                                <SelectItem value="LANGUAGE">Language</SelectItem>
                                <SelectItem value="PHYSICAL">Physical</SelectItem>
                                <SelectItem value="ARTS">Arts</SelectItem>
                                <SelectItem value="COMPUTER">Computer</SelectItem>
                                <SelectItem value="SOCIAL">Social</SelectItem>
                                <SelectItem value="COMMERCE">Commerce</SelectItem>
                                <SelectItem value="SCIENCE">Science</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="level">Level</Label>
                            <Input
                              id="level"
                              type="number"
                              value={subjectForm.level}
                              onChange={(e) => setSubjectForm({ ...subjectForm, level: parseInt(e.target.value) })}
                              placeholder="e.g., 1, 2, 3"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={subjectForm.description}
                            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                            placeholder="Optional description"
                          />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Subject'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell>{subject.subjectCode}</TableCell>
                        <TableCell>{subject._count.classGrades}</TableCell>
                        <TableCell>
                          <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Subject-Class Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Subject-Class Assignments</CardTitle>
                <CardDescription>
                  Assign subjects to classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectGrades.map((sg) => (
                      <TableRow key={sg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sg.subject.subjectName}</div>
                            <div className="text-sm text-muted-foreground">{sg.subject.subjectCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sg.class.className}</div>
                            <div className="text-sm text-muted-foreground">{sg.class.classCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sg.class.batch.batchName}</div>
                            <div className="text-sm text-muted-foreground">{sg.class.batch.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubjectGradeRemove(sg.subject.id, sg.class.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Academic Calendar</CardTitle>
                  <CardDescription>
                    Manage school events, holidays, and important dates
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Add a new event to the academic calendar
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                          id="title"
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          placeholder="e.g., Parent-Teacher Meeting"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventType">Event Type</Label>
                        <Select value={eventForm.eventType} onValueChange={(value: any) => setEventForm({ ...eventForm, eventType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOLIDAY">Holiday</SelectItem>
                            <SelectItem value="EXAM">Exam</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                            <SelectItem value="MEETING">Meeting</SelectItem>
                            <SelectItem value="DEADLINE">Deadline</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={eventForm.startDate}
                          onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={eventForm.endDate}
                          onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          placeholder="Optional location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
                      <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{event.endDate ? new Date(event.endDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{event.location || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={event.isActive ? 'default' : 'secondary'}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exams</CardTitle>
                  <CardDescription>
                    Manage exams and assessments
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Exam</DialogTitle>
                      <DialogDescription>
                        Add a new exam to the system
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleExamSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="examName">Exam Name</Label>
                        <Input
                          id="examName"
                          value={examForm.examName}
                          onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                          placeholder="e.g., Mathematics Mid-Term"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="examType">Exam Type</Label>
                        <Select value={examForm.examType} onValueChange={(value: any) => setExamForm({ ...examForm, examType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUIZ">Quiz</SelectItem>
                            <SelectItem value="TEST">Test</SelectItem>
                            <SelectItem value="MID_TERM">Mid-Term</SelectItem>
                            <SelectItem value="FINAL">Final</SelectItem>
                            <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                            <SelectItem value="PROJECT">Project</SelectItem>
                            <SelectItem value="PRACTICAL">Practical</SelectItem>
                            <SelectItem value="ORAL">Oral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subjectId">Subject</Label>
                        <Select value={examForm.subjectId} onValueChange={(value) => setExamForm({ ...examForm, subjectId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.subjectName} ({subject.subjectCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="classId">Class</Label>
                        <Select value={examForm.classId} onValueChange={(value) => setExamForm({ ...examForm, classId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.className} - {classItem.batch.batchName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="totalMarks">Total Marks</Label>
                          <Input
                            id="totalMarks"
                            type="number"
                            value={examForm.totalMarks}
                            onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                            placeholder="100"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="passingMarks">Passing Marks</Label>
                          <Input
                            id="passingMarks"
                            type="number"
                            value={examForm.passingMarks}
                            onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                            placeholder="40"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={examForm.duration}
                          onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })}
                          placeholder="120"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={examForm.instructions}
                          onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                          placeholder="Optional instructions for students"
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Exam'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.examName}</TableCell>
                      <TableCell>{getExamTypeBadge(exam.examType)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.subject.subjectName}</div>
                          <div className="text-sm text-muted-foreground">{exam.subject.subjectCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.class.className}</div>
                          <div className="text-sm text-muted-foreground">{exam.class.batch.batchName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.totalMarks}</div>
                          <div className="text-sm text-muted-foreground">Pass: {exam.passingMarks}</div>
                        </div>
                      </TableCell>
                      <TableCell>{exam.duration} min</TableCell>
                      <TableCell>{exam._count.results}</TableCell>
                      <TableCell>
                        <Badge variant={exam.isActive ? 'default' : 'secondary'}>
                          {exam.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
              <CardDescription>
                View and manage exam results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.student.name}</div>
                          <div className="text-sm text-muted-foreground">{result.student.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.exam.examName}</div>
                          <div className="text-sm text-muted-foreground">{result.exam.examType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.exam.subject.subjectName}</div>
                          <div className="text-sm text-muted-foreground">{result.exam.subject.subjectCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.exam.class.className}</div>
                          <div className="text-sm text-muted-foreground">{result.exam.class.classCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.marksObtained}</div>
                          <div className="text-sm text-muted-foreground">/ {result.exam.totalMarks}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getGradeBadge(result.grade || '', result.isPassed)}</TableCell>
                      <TableCell>
                        <Badge variant={result.isPassed ? 'default' : 'destructive'}>
                          {result.isPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicManagement;
