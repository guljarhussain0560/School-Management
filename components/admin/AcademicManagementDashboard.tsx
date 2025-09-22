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
import { Progress } from '@/components/ui/progress';
import { 
  User, FileSpreadsheet, GraduationCap, Upload, Download, Search, 
  CheckCircle, Clock, AlertCircle, Eye, UserPlus, DollarSign, 
  Building, Users, BarChart3, Share2,
  BookOpen, Calendar, FileText, Settings, Menu, X, UploadCloud, UserPlus2,
  ChevronLeft, ChevronRight, Filter, RefreshCw, MapPin
} from 'lucide-react';
import CurriculumManagement from '@/components/academic/CurriculumManagement';
import AttendanceManagement from '@/components/academic/AttendanceManagement';
import AcademicManagement from '@/components/academic/AcademicManagement';
import ExamManagement from '@/components/academic/ExamManagement';
import AcademicCalendar from '@/components/academic/AcademicCalendar';
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
    studentName: '',
    subject: '',
    grade: '',
    marks: '',
    maxMarks: '100',
    examType: '',
    examDate: '',
    remarks: ''
  });

  // Performance Display State
  const [performances, setPerformances] = useState([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState<Record<string, string[]>>({});
  const [grades, setGrades] = useState<string[]>([]);
  const [isLoadingPerformances, setIsLoadingPerformances] = useState(false);
  const [performanceCurrentPage, setPerformanceCurrentPage] = useState(1);
  const [performanceTotalPages, setPerformanceTotalPages] = useState(1);
  const [performanceSearch, setPerformanceSearch] = useState('');
  const [performanceGradeFilter, setPerformanceGradeFilter] = useState('');
  const [performanceSubjectFilter, setPerformanceSubjectFilter] = useState('');

  // Bulk Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Student Bulk Upload State
  const [isStudentUploading, setIsStudentUploading] = useState(false);
  const [studentUploadProgress, setStudentUploadProgress] = useState(0);

  // Student Search State
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [showStudentResults, setShowStudentResults] = useState(false);

  // Attendance State
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    grade: '',
    subject: ''
  });
  
  // Attendance Management State
  const [attendanceGrades, setAttendanceGrades] = useState<string[]>([
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ]);
  const [attendanceStudents, setAttendanceStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
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
  const [assignments, setAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignmentCurrentPage, setAssignmentCurrentPage] = useState(1);
  const [assignmentTotalPages, setAssignmentTotalPages] = useState(1);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentGradeFilter, setAssignmentGradeFilter] = useState('');
  const [assignmentSubjectFilter, setAssignmentSubjectFilter] = useState('');

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
  
  // Admission Statistics
  const [admissionStats, setAdmissionStats] = useState({
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
    total: 0
  });

  // Pagination and Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);

  // Student Search Handler
  const handleStudentSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setStudentSearchResults([]);
      setShowStudentResults(false);
      return;
    }

    setIsSearchingStudents(true);
    try {
      const response = await fetch(`/api/academic/students/search?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setStudentSearchResults(data.students);
        setShowStudentResults(true);
      }
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setIsSearchingStudents(false);
    }
  };

  // Select Student Handler
  const handleSelectStudent = (student: any) => {
    setPerformanceForm(prev => ({
      ...prev,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade // Still auto-fill grade from student data, but user can change it
    }));
    setShowStudentResults(false);
    toast.success(`Selected student: ${student.name}`);
    
    // Fetch subjects for the selected student's grade
    if (student.grade) {
      fetchSubjects(student.grade);
    }
  };

  // Handle Grade Change
  const handleGradeChange = (grade: string) => {
    setPerformanceForm(prev => ({
      ...prev,
      grade: grade,
      subject: '' // Reset subject when grade changes
    }));
    
    // Fetch subjects for the selected grade
    if (grade) {
      fetchSubjects(grade);
    }
  };

  // Handle Assignment Grade Change
  const handleAssignmentGradeChange = (grade: string) => {
    setAssignmentForm(prev => ({
      ...prev,
      grade: grade,
      subject: '' // Reset subject when grade changes
    }));
    
    // Fetch subjects for the selected grade
    if (grade) {
      fetchSubjects(grade);
    }
  };

  // Assignment Submit Handler
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/academic/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignmentForm,
          dueDate: assignmentForm.dueDate
        })
      });

      if (response.ok) {
        toast.success('Assignment created successfully');
        setAssignmentForm({
          title: '', subject: '', grade: '', dueDate: '', description: '', file: null
        });
        fetchAssignments(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create assignment');
      }
    } catch (error) {
      toast.error('Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Assignments
  const fetchAssignments = async (page: number = 1, search: string = '', grade: string = '', subject: string = '') => {
    setIsLoadingAssignments(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        grade,
        subject
      });

      const response = await fetch(`/api/academic/assignments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
        setAssignmentTotalPages(data.pagination.pages);
        setAssignmentCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // Handle Assignment Page Change
  const handleAssignmentPageChange = (page: number) => {
    setAssignmentCurrentPage(page);
    const gradeFilter = assignmentGradeFilter === 'all' ? '' : assignmentGradeFilter;
    const subjectFilter = assignmentSubjectFilter === 'all' ? '' : assignmentSubjectFilter;
    fetchAssignments(page, assignmentSearch, gradeFilter, subjectFilter);
  };

  // Handle Assignment Search
  const handleAssignmentSearch = () => {
    setAssignmentCurrentPage(1);
    const gradeFilter = assignmentGradeFilter === 'all' ? '' : assignmentGradeFilter;
    const subjectFilter = assignmentSubjectFilter === 'all' ? '' : assignmentSubjectFilter;
    fetchAssignments(1, assignmentSearch, gradeFilter, subjectFilter);
  };

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
          studentId: '', studentName: '', subject: '', grade: '', marks: '', maxMarks: '100', examType: '', examDate: '', remarks: ''
        });
        fetchPerformances(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create performance record');
      }
    } catch (error) {
      toast.error('Error creating performance record');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Grades from subjects.json
  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        // Get grades from subjects.json
        const gradesFromSubjects = Object.keys(data.subjectsByGrade || {});
        setGrades(gradesFromSubjects);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // Fetch Subjects from subjects.json
  const fetchSubjects = async (grade?: string) => {
    try {
      const response = await fetch('/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjectsByGrade(data.subjectsByGrade || {});
        setSubjects(data.allSubjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch Performances
  const fetchPerformances = async (page: number = 1, search: string = '', grade: string = '', subject: string = '') => {
    setIsLoadingPerformances(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        grade,
        subject
      });

      const response = await fetch(`/api/academic/student-performance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPerformances(data.performances);
        setSubjects(data.subjects);
        setPerformanceTotalPages(data.pagination.pages);
        setPerformanceCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setIsLoadingPerformances(false);
    }
  };

  // Handle Performance Page Change
  const handlePerformancePageChange = (page: number) => {
    setPerformanceCurrentPage(page);
    const gradeFilter = performanceGradeFilter === 'all' ? '' : performanceGradeFilter;
    const subjectFilter = performanceSubjectFilter === 'all' ? '' : performanceSubjectFilter;
    fetchPerformances(page, performanceSearch, gradeFilter, subjectFilter);
  };

  // Handle Performance Search
  const handlePerformanceSearch = () => {
    setPerformanceCurrentPage(1);
    const gradeFilter = performanceGradeFilter === 'all' ? '' : performanceGradeFilter;
    const subjectFilter = performanceSubjectFilter === 'all' ? '' : performanceSubjectFilter;
    fetchPerformances(1, performanceSearch, gradeFilter, subjectFilter);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/academic/student-performance', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.errorCount > 0) {
          toast.warning(`Upload completed with ${result.errorCount} errors. ${result.successCount} records processed successfully.`);
          // Show errors in small red text
          if (result.errors && result.errors.length > 0) {
            const errorElement = document.createElement('div');
            errorElement.className = 'mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700';
            errorElement.innerHTML = `<strong>Failed uploads:</strong><br/>${result.errors.slice(0, 3).join('<br/>')}${result.errors.length > 3 ? '<br/>...' : ''}`;
            document.querySelector('.upload-details-container')?.appendChild(errorElement);
          }
        } else {
          toast.success(result.message);
        }
        fetchPerformances(); // Refresh the list
      } else {
        const error = await response.json();
        if (error.errors && error.errors.length > 0) {
          // Handle specific student not found errors
          const studentNotFoundErrors = error.errors.filter((err: string) => 
            err.includes('Student not found')
          );
          
          if (studentNotFoundErrors.length > 0) {
            // Extract student IDs from error messages
            const studentIds = studentNotFoundErrors.map((err: string) => {
              const match = err.match(/ID: ([A-Z0-9]+)/);
              return match ? match[1] : 'Unknown';
            });
            
            toast.error(`Student(s) not found: ${studentIds.join(', ')}`);
          } else {
            toast.error(error.error || 'Failed to upload performance data');
          }
        } else {
          toast.error(error.error || 'Failed to upload performance data');
        }
      }
    } catch (error) {
      console.error('Error processing performance file:', error);
      toast.error('Error processing performance file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
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

    setIsStudentUploading(true);
    setStudentUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setStudentUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/academic/students/bulk', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setStudentUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.errorCount > 0) {
          toast.warning(`Upload completed with ${result.errorCount} errors. ${result.successCount} students enrolled successfully.`);
        } else {
          toast.success(result.message);
        }
        
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
        if (error.errors && error.errors.length > 0) {
          // Handle specific student errors
          const studentErrors = error.errors.filter((err: string) => 
            err.includes('Missing required fields') || err.includes('Row')
          );
          
          if (studentErrors.length > 0) {
            toast.error(`Upload failed: ${studentErrors.slice(0, 3).join(', ')}${studentErrors.length > 3 ? '...' : ''}`);
          } else {
            toast.error(error.error || 'Failed to upload student data');
          }
        } else {
          toast.error(error.error || 'Failed to upload student data');
        }
      }
    } catch (error) {
      console.error('Error processing student batch file:', error);
      toast.error('Error processing student batch file');
    } finally {
      setIsStudentUploading(false);
      setStudentUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadStudentTemplate = () => {
    const templateData = [
      ['Student ID', 'Subject', 'Grade', 'Exam Type', 'Marks', 'Max Marks', 'Exam Date', 'Remarks'],
      ['STU12345678', 'Mathematics', 'Grade 5', 'Quiz', '85', '100', '2024-01-15', 'Good performance'],
      ['STU87654321', 'English', 'Grade 5', 'Test', '92', '100', '2024-01-16', 'Excellent work'],
      ['STU11223344', 'Science', 'Grade 6', 'Exam', '78', '100', '2024-01-17', 'Needs improvement']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance Template');
    XLSX.writeFile(wb, 'performance_template.xlsx');
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
        setRecentApplications(data.admissions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || page);
        
        // Update admission statistics from the response
        if (data.stats) {
          setAdmissionStats({
            approved: data.stats.approved || 0,
            pending: data.stats.pending || 0,
            underReview: data.stats.underReview || 0,
            rejected: data.stats.rejected || 0,
            total: data.stats.total || 0
          });
        }
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

  const updateAdmissionStats = (updatedApplication: any, newStatus: string, oldStatus: string) => {
    setAdmissionStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Update counts based on status change
      if (oldStatus === 'Approved' && newStatus !== 'Approved') {
        newStats.approved = Math.max(0, newStats.approved - 1);
      } else if (oldStatus !== 'Approved' && newStatus === 'Approved') {
        newStats.approved = newStats.approved + 1;
      }
      
      if (oldStatus === 'Pending' && newStatus !== 'Pending') {
        newStats.pending = Math.max(0, newStats.pending - 1);
      } else if (oldStatus !== 'Pending' && newStatus === 'Pending') {
        newStats.pending = newStats.pending + 1;
      }
      
      if (oldStatus === 'Under Review' && newStatus !== 'Under Review') {
        newStats.underReview = Math.max(0, newStats.underReview - 1);
      } else if (oldStatus !== 'Under Review' && newStatus === 'Under Review') {
        newStats.underReview = newStats.underReview + 1;
      }
      
      if (oldStatus === 'Rejected' && newStatus !== 'Rejected') {
        newStats.rejected = Math.max(0, newStats.rejected - 1);
      } else if (oldStatus !== 'Rejected' && newStatus === 'Rejected') {
        newStats.rejected = newStats.rejected + 1;
      }
      
      return newStats;
    });
  };

  const fetchAdmissionSummaryOnly = async () => {
    try {
      const response = await fetch('/api/academic/recent-admissions?page=1&limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setAdmissionStats({
            approved: data.stats.approved || 0,
            pending: data.stats.pending || 0,
            underReview: data.stats.underReview || 0,
            rejected: data.stats.rejected || 0,
            total: data.stats.total || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching admission summary:', error);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      // Find the application to get the student ID
      const application = recentApplications.find(app => app.id === applicationId);
      if (!application) {
        toast.error('Application not found');
        return;
      }

      // Make API call to update the status in the database
      const response = await fetch(`/api/academic/students/${application.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedApplication = result.student;
        
        // Update only the specific application in the local state
        setRecentApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        
        // Update admission statistics only
        updateAdmissionStats(application, newStatus, application.status);
        
        toast.success(`Application status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  // Fetch Attendance Grades
  const fetchAttendanceGrades = async () => {
    try {
      const response = await fetch('/api/academic/attendance/grades');
      if (response.ok) {
        const data = await response.json();
        setAttendanceGrades(data.grades);
        console.log('Attendance grades loaded:', data.grades);
      } else {
        console.error('Failed to fetch attendance grades:', response.status);
        // Fallback to hardcoded grades
        const fallbackGrades = [
          "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
          "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
        ];
        setAttendanceGrades(fallbackGrades);
        console.log('Using fallback grades:', fallbackGrades);
      }
    } catch (error) {
      console.error('Error fetching attendance grades:', error);
      // Fallback to hardcoded grades
      const fallbackGrades = [
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
        "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
      ];
      setAttendanceGrades(fallbackGrades);
      console.log('Using fallback grades due to error:', fallbackGrades);
    }
  };

  // Fetch Students for Attendance
  const fetchAttendanceStudents = async (grade: string) => {
    if (!grade || grade === 'all') {
      setAttendanceStudents([]);
      return;
    }

    setIsLoadingAttendance(true);
    try {
      const response = await fetch(`/api/academic/attendance/students?grade=${encodeURIComponent(grade)}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceStudents(data.students);
        
        // Initialize attendance records (default to PRESENT)
        const initialRecords: Record<string, 'PRESENT' | 'ABSENT'> = {};
        data.students.forEach((student: any) => {
          initialRecords[student.id] = 'PRESENT';
        });
        setAttendanceRecords(initialRecords);
        
        // Update summary
        updateAttendanceSummary(initialRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance students:', error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Update Attendance Summary
  const updateAttendanceSummary = (records: Record<string, 'PRESENT' | 'ABSENT'>) => {
    const total = Object.keys(records).length;
    const present = Object.values(records).filter(status => status === 'PRESENT').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    setAttendanceSummary({ total, present, absent, percentage });
  };

  // Handle Attendance Status Change
  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    const newRecords = { ...attendanceRecords, [studentId]: status };
    setAttendanceRecords(newRecords);
    updateAttendanceSummary(newRecords);
  };

  // Mark All Present
  const markAllPresent = () => {
    const newRecords: Record<string, 'PRESENT' | 'ABSENT'> = {};
    attendanceStudents.forEach(student => {
      newRecords[student.id] = 'PRESENT';
    });
    setAttendanceRecords(newRecords);
    updateAttendanceSummary(newRecords);
  };

  // Mark All Absent
  const markAllAbsent = () => {
    const newRecords: Record<string, 'PRESENT' | 'ABSENT'> = {};
    attendanceStudents.forEach(student => {
      newRecords[student.id] = 'ABSENT';
    });
    setAttendanceRecords(newRecords);
    updateAttendanceSummary(newRecords);
  };

  // Save Attendance
  const saveAttendance = async () => {
    if (!attendanceForm.grade || !attendanceForm.subject) {
      toast.error('Please select grade and subject');
      return;
    }

    if (attendanceStudents.length === 0) {
      toast.error('No students found for the selected criteria');
      return;
    }

    setIsSavingAttendance(true);
    try {
      const attendanceData = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await fetch('/api/academic/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceForm.date,
          grade: attendanceForm.grade,
          subject: attendanceForm.subject,
          attendanceRecords: attendanceData
        })
      });

      if (response.ok) {
        toast.success('Attendance saved successfully');
        // Reset form
        setAttendanceForm({
          date: new Date().toISOString().split('T')[0],
          grade: '',
          subject: ''
        });
        setAttendanceStudents([]);
        setAttendanceRecords({});
        setAttendanceSummary({ total: 0, present: 0, absent: 0, percentage: 0 });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error saving attendance');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  useEffect(() => {
    if (activeSubSection === 'recent-admissions') {
    fetchRecentAdmissions();
    }
    if (activeSubSection === 'performance') {
      fetchPerformances();
      fetchGrades();
      fetchSubjects();
    }
    if (activeSubSection === 'attendance') {
      fetchAttendanceGrades();
      fetchSubjects(); // Also fetch subjects for grade-dependent selection
    }
    if (activeSubSection === 'assignments') {
      fetchAssignments();
      fetchGrades();
      fetchSubjects();
    }
  }, [activeSubSection]);

  const renderContent = () => {
    switch (activeSubSection) {
      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
              <p className="text-gray-600">Track and manage student academic performance</p>
            </div>

            {/* Individual Performance Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add Performance Record
                </CardTitle>
                <CardDescription>
                  Add performance record for individual students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePerformanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="studentSearch">Student Search</Label>
                      <Input
                        id="studentSearch"
                        placeholder="Search by name, roll number, or admission number"
                        value={performanceForm.studentName}
                        onChange={(e) => {
                          setPerformanceForm({...performanceForm, studentName: e.target.value});
                          handleStudentSearch(e.target.value);
                        }}
                        required
                      />
                      {showStudentResults && studentSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {studentSearchResults.map((student: any) => (
                            <div
                              key={student.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                              onClick={() => handleSelectStudent(student)}
                            >
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-500">
                                {student.studentId} • {student.rollNumber} • {student.grade}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={performanceForm.subject}
                        onValueChange={(value) => setPerformanceForm({...performanceForm, subject: value})}
                        disabled={!performanceForm.grade}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={performanceForm.grade ? "Select subject" : "Select grade first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {performanceForm.grade && subjectsByGrade[performanceForm.grade] ? (
                            subjectsByGrade[performanceForm.grade].map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-subjects" disabled>
                              {performanceForm.grade ? "No subjects available" : "Select a grade first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={performanceForm.grade}
                        onValueChange={handleGradeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="Project">Project</SelectItem>
                          <SelectItem value="Practical">Practical</SelectItem>
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
                      placeholder="Enter any remarks (optional)"
                      value={performanceForm.remarks}
                      onChange={(e) => setPerformanceForm({...performanceForm, remarks: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !performanceForm.studentName || !performanceForm.subject || !performanceForm.grade || !performanceForm.marks || !performanceForm.maxMarks || !performanceForm.examDate}
                  >
                    {loading ? 'Creating...' : 'Create Performance Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>

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
                {/* Excel Format Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Excel/CSV Format Requirements:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Required Columns:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Student ID:</strong> Student ID (STU + 8 digits), Roll Number, or Admission Number</li>
                      <li><strong>Subject:</strong> Subject name (e.g., Mathematics, English, Science)</li>
                      <li><strong>Grade:</strong> Student grade (e.g., Grade 5, Grade 10)</li>
                      <li><strong>Exam Type:</strong> Quiz, Test, Exam, Assignment, Project, or Practical</li>
                      <li><strong>Marks:</strong> Marks obtained by student</li>
                      <li><strong>Max Marks:</strong> Maximum marks for the exam (default: 100)</li>
                      <li><strong>Exam Date:</strong> Date in YYYY-MM-DD format (e.g., 2024-01-15)</li>
                      <li><strong>Remarks:</strong> Optional remarks or comments</li>
                    </ul>
                  </div>
                </div>

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
                        disabled={isUploading}
                      />
                      <Button asChild disabled={isUploading}>
                        <label htmlFor="performance-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                  
                  {/* Upload Details */}
                  <div className="upload-details-container">
                    {isUploading && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Uploading Performance Data...</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full mb-2" />
                        <p className="text-xs text-blue-700">Processing Excel file: {uploadProgress}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Performance Records
                </CardTitle>
                <CardDescription>
                  Search and filter performance records by various criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="performanceSearch">Search</Label>
                    <Input
                      id="performanceSearch"
                      placeholder="Search by student, subject, exam type..."
                      value={performanceSearch}
                      onChange={(e) => setPerformanceSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="performanceGrade">Grade</Label>
                    <Select
                      value={performanceGradeFilter}
                      onValueChange={(value) => {
                        setPerformanceGradeFilter(value);
                        setPerformanceSubjectFilter('all'); // Reset subject when grade changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="performanceSubject">Subject</Label>
                    <Select
                      value={performanceSubjectFilter}
                      onValueChange={setPerformanceSubjectFilter}
                      disabled={!performanceGradeFilter || performanceGradeFilter === 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={performanceGradeFilter && performanceGradeFilter !== 'all' ? "Select subject" : "Select grade first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {performanceGradeFilter && performanceGradeFilter !== 'all' && subjectsByGrade[performanceGradeFilter] ? (
                          subjectsByGrade[performanceGradeFilter].map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-subjects" disabled>
                            {performanceGradeFilter && performanceGradeFilter !== 'all' ? "No subjects available" : "Select a grade first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handlePerformanceSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Records Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Records
                </CardTitle>
                <CardDescription>
                  View and manage student performance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPerformances ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading performances...
                  </div>
                ) : performances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No performance records found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {performances.map((performance: any) => (
                      <div key={performance.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-medium text-gray-900">{performance.student.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {performance.student.studentId} • {performance.student.rollNumber} • {performance.grade}
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div>
                                  <p className="text-sm text-gray-500">Subject</p>
                                  <p className="font-medium">{performance.subject}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Exam Type</p>
                                  <p className="font-medium">{performance.examType}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Marks</p>
                                  <p className="font-medium">
                                    {performance.marks}/{performance.maxMarks}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Percentage</p>
                                  <p className="font-medium">
                                    {((performance.marks / performance.maxMarks) * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p className="font-medium">
                                    {performance.examDate ? new Date(performance.examDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {performance.remarks && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Remarks:</strong> {performance.remarks}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {performance.creator.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Performance Pagination */}
                    {performanceTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                          Page {performanceCurrentPage} of {performanceTotalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePerformancePageChange(performanceCurrentPage - 1)}
                            disabled={performanceCurrentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePerformancePageChange(performanceCurrentPage + 1)}
                            disabled={performanceCurrentPage === performanceTotalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        );

      case 'attendance':
        return <AttendanceManagement />;

      case 'assignments':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
              <p className="text-gray-600">Create and manage student assignments</p>
            </div>

            {/* Create Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Assignment
                </CardTitle>
                <CardDescription>
                  Create a new assignment for students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignmentTitle">Assignment Title *</Label>
                      <Input
                        id="assignmentTitle"
                        placeholder="Enter assignment title"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignmentGrade">Grade *</Label>
                      <Select
                        value={assignmentForm.grade}
                        onValueChange={handleAssignmentGradeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignmentSubject">Subject *</Label>
                      <Select
                        value={assignmentForm.subject}
                        onValueChange={(value) => setAssignmentForm({...assignmentForm, subject: value})}
                        disabled={!assignmentForm.grade}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={assignmentForm.grade ? "Select subject" : "Select grade first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignmentForm.grade && subjectsByGrade[assignmentForm.grade] ? (
                            subjectsByGrade[assignmentForm.grade].map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-subjects" disabled>
                              {assignmentForm.grade ? "No subjects available" : "Select a grade first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignmentDueDate">Due Date *</Label>
                      <Input
                        id="assignmentDueDate"
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assignmentDescription">Description</Label>
                    <Textarea
                      id="assignmentDescription"
                      placeholder="Enter assignment description (optional)"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignmentFile">Assignment File (Optional)</Label>
                    <Input
                      id="assignmentFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={(e) => setAssignmentForm({...assignmentForm, file: e.target.files?.[0] || null})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !assignmentForm.title || !assignmentForm.subject || !assignmentForm.grade || !assignmentForm.dueDate}
                  >
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Assignment Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Assignments
                </CardTitle>
                <CardDescription>
                  Search and filter assignments by various criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="assignmentSearch">Search</Label>
                    <Input
                      id="assignmentSearch"
                      placeholder="Search by title or description..."
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignmentGradeFilter">Grade</Label>
                    <Select
                      value={assignmentGradeFilter}
                      onValueChange={(value) => {
                        setAssignmentGradeFilter(value);
                        setAssignmentSubjectFilter('all'); // Reset subject when grade changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignmentSubjectFilter">Subject</Label>
                    <Select
                      value={assignmentSubjectFilter}
                      onValueChange={setAssignmentSubjectFilter}
                      disabled={!assignmentGradeFilter || assignmentGradeFilter === 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={assignmentGradeFilter && assignmentGradeFilter !== 'all' ? "Select subject" : "Select grade first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {assignmentGradeFilter && assignmentGradeFilter !== 'all' && subjectsByGrade[assignmentGradeFilter] ? (
                          subjectsByGrade[assignmentGradeFilter].map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-subjects" disabled>
                            {assignmentGradeFilter && assignmentGradeFilter !== 'all' ? "No subjects available" : "Select a grade first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAssignmentSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignments List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignments List
                </CardTitle>
                <CardDescription>
                  View and manage all assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAssignments ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading assignments...
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No assignments found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {assignment.grade} • {assignment.subject}
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div>
                                  <p className="text-sm text-gray-500">Due Date</p>
                                  <p className="font-medium">
                                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <Badge variant={
                                    assignment.status === 'COMPLETED' ? 'default' :
                                    assignment.status === 'OVERDUE' ? 'destructive' : 'secondary'
                                  }>
                                    {assignment.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Students</p>
                                  <p className="font-medium">{assignment.students?.length || 0}</p>
                                </div>
                              </div>
                            </div>
                            {assignment.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Description:</strong> {assignment.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {assignment.creator.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Assignment Pagination */}
                    {assignmentTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                          Page {assignmentCurrentPage} of {assignmentTotalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignmentPageChange(assignmentCurrentPage - 1)}
                            disabled={assignmentCurrentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignmentPageChange(assignmentCurrentPage + 1)}
                            disabled={assignmentCurrentPage === assignmentTotalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'curriculum':
        return <CurriculumManagement />;

      case 'exams':
        return <ExamManagement />;

      case 'academic-calendar':
        return <AcademicCalendar />;

      case 'academic-management':
        return <AcademicManagement />;

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
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
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
                  <Button 
                    type="submit" 
                    disabled={loading || !studentForm.fullName || !studentForm.age || !studentForm.address || !studentForm.parentName || !studentForm.contactNumber || !studentForm.emailAddress}
                  >
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
                  
                  {isStudentUploading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading... {studentUploadProgress}%</span>
                      </div>
                      <Progress value={studentUploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadStudentTemplate} disabled={isStudentUploading}>
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
                        disabled={isStudentUploading}
                      />
                      <Button asChild disabled={isStudentUploading}>
                        <label htmlFor="student-batch-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {isStudentUploading ? 'Uploading...' : 'Upload File'}
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
                  
                  {isStudentUploading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading... {studentUploadProgress}%</span>
                      </div>
                      <Progress value={studentUploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadStudentTemplate} disabled={isStudentUploading}>
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
                        disabled={isStudentUploading}
                      />
                      <Button asChild disabled={isStudentUploading}>
                        <label htmlFor="batch-upload-file" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {isStudentUploading ? 'Uploading...' : 'Upload File'}
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
                        {admissionStats.approved}
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
                        {admissionStats.pending}
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
                        {admissionStats.underReview}
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
