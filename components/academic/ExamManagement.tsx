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
  Plus, Edit, Trash2, Eye, Calendar, Clock, 
  FileText, Users, Award, AlertCircle, CheckCircle,
  Download, Upload, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';

interface Exam {
  id: string;
  examName: string;
  examType: string;
  subject: {
    id: string;
    subjectName: string;
  };
  class: {
    id: string;
    className: string;
  };
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  schedules: ExamSchedule[];
  results: ExamResult[];
}

interface ExamSchedule {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  supervisor?: string;
  isActive: boolean;
}

interface ExamResult {
  id: string;
  student: {
    id: string;
    name: string;
    rollNumber: string;
  };
  marksObtained: number;
  grade?: string;
  remarks?: string;
  isPassed: boolean;
}

interface Subject {
  id: string;
  subjectName: string;
}

interface Class {
  id: string;
  className: string;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    fetchExams();
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/academic/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const handleCreateExam = async (data: any) => {
    try {
      const response = await fetch('/api/academic/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Exam created successfully');
        setShowCreateDialog(false);
        fetchExams();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    }
  };

  const handleBulkCreateExams = async (data: any[]) => {
    try {
      const response = await fetch('/api/academic/exams/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exams: data })
      });

      if (response.ok) {
        toast.success(`${data.length} exams created successfully`);
        fetchExams();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create exams');
      }
    } catch (error) {
      console.error('Error creating exams:', error);
      toast.error('Failed to create exams');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const response = await fetch(`/api/academic/exams/${examId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Exam deleted successfully');
        fetchExams();
      } else {
        toast.error('Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exam.examType === filterType;
    const matchesClass = filterClass === 'all' || exam.class.id === filterClass;
    
    return matchesSearch && matchesType && matchesClass;
  });

  const examFields = [
    { name: 'examName', label: 'Exam Name', type: 'text' as const, required: true, placeholder: 'Enter exam name' },
    { name: 'examType', label: 'Exam Type', type: 'select' as const, required: true, 
      options: [
        { value: 'QUIZ', label: 'Quiz' },
        { value: 'TEST', label: 'Test' },
        { value: 'MID_TERM', label: 'Mid Term' },
        { value: 'FINAL', label: 'Final' },
        { value: 'ASSIGNMENT', label: 'Assignment' },
        { value: 'PROJECT', label: 'Project' },
        { value: 'PRACTICAL', label: 'Practical' },
        { value: 'ORAL', label: 'Oral' }
      ]
    },
    { name: 'subjectId', label: 'Subject', type: 'select' as const, required: true, 
      options: subjects.map(s => ({ value: s.id, label: s.subjectName }))
    },
    { name: 'classId', label: 'Class', type: 'select' as const, required: true,
      options: classes.map(c => ({ value: c.id, label: c.className }))
    },
    { name: 'totalMarks', label: 'Total Marks', type: 'number' as const, required: true, placeholder: '100' },
    { name: 'passingMarks', label: 'Passing Marks', type: 'number' as const, required: true, placeholder: '40' },
    { name: 'duration', label: 'Duration (minutes)', type: 'number' as const, required: true, placeholder: '120' },
    { name: 'instructions', label: 'Instructions', type: 'textarea' as const, required: false, placeholder: 'Exam instructions...' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Exam Management</h2>
          <p className="text-gray-600">Create and manage exams, schedules, and results</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Create a new exam with all necessary details
              </DialogDescription>
            </DialogHeader>
            <FormWithExcel
              title="Exam Details"
              fields={examFields}
              templateKey="exams"
              onSubmit={handleCreateExam}
              onBulkSubmit={handleBulkCreateExams}
              submitButtonText="Create Exam"
            />
          </DialogContent>
        </Dialog>
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
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="type-filter">Exam Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="TEST">Test</SelectItem>
                  <SelectItem value="MID_TERM">Mid Term</SelectItem>
                  <SelectItem value="FINAL">Final</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="PRACTICAL">Practical</SelectItem>
                  <SelectItem value="ORAL">Oral</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exams ({filteredExams.length})</CardTitle>
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
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.examName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.examType}</Badge>
                    </TableCell>
                    <TableCell>{exam.subject.subjectName}</TableCell>
                    <TableCell>{exam.class.className}</TableCell>
                    <TableCell>{exam.passingMarks}/{exam.totalMarks}</TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell>
                      <Badge variant={exam.isActive ? "default" : "secondary"}>
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowScheduleDialog(true);
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowResultsDialog(true);
                          }}
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id)}
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

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exam Schedule</DialogTitle>
            <DialogDescription>
              Manage schedule for {selectedExam?.examName}
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exam Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Input placeholder="Exam hall/room" />
                </div>
              </div>
              <div>
                <Label>Supervisor</Label>
                <Input placeholder="Supervisor name" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button>Save Schedule</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Exam Results</DialogTitle>
            <DialogDescription>
              View and manage results for {selectedExam?.examName}
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{selectedExam.examType}</Badge>
                  <span className="text-sm text-gray-600">
                    {selectedExam.subject.subjectName} - {selectedExam.class.className}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Results
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedExam.results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.student.name}</TableCell>
                      <TableCell>{result.student.rollNumber}</TableCell>
                      <TableCell>{result.marksObtained}</TableCell>
                      <TableCell>{result.grade || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={result.isPassed ? "default" : "destructive"}>
                          {result.isPassed ? "Passed" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;
