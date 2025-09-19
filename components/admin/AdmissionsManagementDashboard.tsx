'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, FileSpreadsheet, GraduationCap, Upload, Download, Search, 
  CheckCircle, Clock, AlertCircle, Eye, UserPlus, DollarSign, 
  Building, Users, BarChart3, Share2,
  BookOpen, Calendar, FileText, Settings, Menu, X, UploadCloud, UserPlus2,
  ChevronLeft, ChevronRight, Filter, RefreshCw, MapPin, Edit, Save
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AdmissionApplication {
  id: number;
  name: string;
  grade: string;
  enrolledDate: string;
  status: string;
}

interface AdmissionsManagementDashboardProps {
  activeSubSection: string;
  setActiveSubSection: (section: string) => void;
}

export default function AdmissionsManagementDashboard({ activeSubSection, setActiveSubSection }: AdmissionsManagementDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState<'basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents'>('basic');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Student details dialog state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<any>(null);

  // Student Onboarding Form State - Organized by Prisma Schema Sections
  const [studentForm, setStudentForm] = useState({
    // Basic Information (from Prisma schema)
    name: '',
    email: '',
    age: '',
    grade: '',
    rollNumber: '',
    parentContact: '',
    address: '',
    idProofUrl: '',
    busRouteId: '',
    
    // Personal Information
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    religion: '',
    
    // Contact Information
    studentPhone: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentOccupation: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Address Information
    permanentAddress: '',
    temporaryAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Academic Information
    previousSchool: '',
    previousGrade: '',
    admissionDate: '',
    admissionNumber: '',
    academicYear: '',
    
    // Medical Information
    medicalConditions: '',
    allergies: '',
    medications: '',
    doctorName: '',
    doctorPhone: '',
    
    // Transport Information
    transportRequired: false,
    pickupAddress: '',
    dropAddress: '',
    
    // Documents (File uploads)
    birthCertificate: null as File | null,
    transferCertificate: null as File | null,
    markSheets: null as File | null,
    medicalCertificate: null as File | null,
    passportPhoto: null as File | null,
    aadharCard: null as File | null,
    parentIdProof: null as File | null,
    otherDocuments: null as File | null
  });

  // Recent Admissions Data
  const [recentApplications, setRecentApplications] = useState<AdmissionApplication[]>([
    { id: 1, name: 'Emma Wilson', grade: 'Grade 5', enrolledDate: '2024-01-15', status: 'Pending' },
    { id: 2, name: 'Jack Brown', grade: 'Grade 3', enrolledDate: '2024-01-14', status: 'Approved' },
    { id: 3, name: 'Sophia Davis', grade: 'Grade 7', enrolledDate: '2024-01-13', status: 'Under Review' }
  ]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);
  const [excelVerificationData, setExcelVerificationData] = useState<any[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  
  // Statistics state
  const [admissionStats, setAdmissionStats] = useState({
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Basic Information (from Prisma schema)
      formData.append('name', studentForm.name);
      formData.append('email', studentForm.email);
      formData.append('age', studentForm.age);
      formData.append('grade', studentForm.grade);
      formData.append('rollNumber', studentForm.rollNumber);
      formData.append('parentContact', studentForm.parentContact);
      formData.append('address', studentForm.address);
      formData.append('idProofUrl', studentForm.idProofUrl);
      formData.append('busRouteId', studentForm.busRouteId);
      
      // Personal Information
      formData.append('dateOfBirth', studentForm.dateOfBirth);
      formData.append('gender', studentForm.gender);
      formData.append('bloodGroup', studentForm.bloodGroup);
      formData.append('nationality', studentForm.nationality);
      formData.append('religion', studentForm.religion);
      
      // Contact Information
      formData.append('studentPhone', studentForm.studentPhone);
      formData.append('parentName', studentForm.parentName);
      formData.append('parentEmail', studentForm.parentEmail);
      formData.append('parentPhone', studentForm.parentPhone);
      formData.append('parentOccupation', studentForm.parentOccupation);
      formData.append('emergencyContact', studentForm.emergencyContact);
      formData.append('emergencyPhone', studentForm.emergencyPhone);
      
      // Address Information
      formData.append('permanentAddress', studentForm.permanentAddress);
      formData.append('temporaryAddress', studentForm.temporaryAddress);
      formData.append('city', studentForm.city);
      formData.append('state', studentForm.state);
      formData.append('pincode', studentForm.pincode);
      
      // Academic Information
      formData.append('previousSchool', studentForm.previousSchool);
      formData.append('previousGrade', studentForm.previousGrade);
      formData.append('admissionDate', studentForm.admissionDate);
      formData.append('admissionNumber', studentForm.admissionNumber);
      formData.append('academicYear', studentForm.academicYear);
      
      // Medical Information
      formData.append('medicalConditions', studentForm.medicalConditions);
      formData.append('allergies', studentForm.allergies);
      formData.append('medications', studentForm.medications);
      formData.append('doctorName', studentForm.doctorName);
      formData.append('doctorPhone', studentForm.doctorPhone);
      
      // Transport Information
      formData.append('transportRequired', studentForm.transportRequired.toString());
      formData.append('pickupAddress', studentForm.pickupAddress);
      formData.append('dropAddress', studentForm.dropAddress);
      
      // Documents (optional file uploads)
      if (studentForm.birthCertificate) formData.append('birthCertificate', studentForm.birthCertificate);
      if (studentForm.transferCertificate) formData.append('transferCertificate', studentForm.transferCertificate);
      if (studentForm.markSheets) formData.append('markSheets', studentForm.markSheets);
      if (studentForm.medicalCertificate) formData.append('medicalCertificate', studentForm.medicalCertificate);
      if (studentForm.passportPhoto) formData.append('passportPhoto', studentForm.passportPhoto);
      if (studentForm.aadharCard) formData.append('aadharCard', studentForm.aadharCard);
      if (studentForm.parentIdProof) formData.append('parentIdProof', studentForm.parentIdProof);
      if (studentForm.otherDocuments) formData.append('otherDocuments', studentForm.otherDocuments);

      const response = await fetch('/api/academic/students', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Student enrolled successfully');
        
        // Reset form
        setStudentForm({
          name: '', email: '', age: '', grade: '', rollNumber: '', parentContact: '', address: '', idProofUrl: '', busRouteId: '',
          dateOfBirth: '', gender: '', bloodGroup: '', nationality: '', religion: '',
          studentPhone: '', parentName: '', parentEmail: '', parentPhone: '', parentOccupation: '', emergencyContact: '', emergencyPhone: '',
          permanentAddress: '', temporaryAddress: '', city: '', state: '', pincode: '',
          previousSchool: '', previousGrade: '', admissionDate: '', admissionNumber: '', academicYear: '',
          medicalConditions: '', allergies: '', medications: '', doctorName: '', doctorPhone: '',
          transportRequired: false, pickupAddress: '', dropAddress: '',
          birthCertificate: null, transferCertificate: null, markSheets: null, medicalCertificate: null, passportPhoto: null, aadharCard: null, parentIdProof: null, otherDocuments: null
        });
        
        // Add to recent applications
        const newApplication = {
          id: Date.now(),
          name: studentForm.name,
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

    setLoading(true);
    try {
      console.log('Uploading file:', file.name, file.type, file.size);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/academic/students/bulk', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        // Add sample applications to recent list
        const newApplications = result.students?.map((student: any, index: number) => ({
          id: Date.now() + index,
          name: student.name,
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
    } finally {
      setLoading(false);
    }
  };

  const downloadStudentTemplate = () => {
    const templateData = [
      // Headers - All fields from Prisma schema organized by sections
      ['Name', 'Email', 'Age', 'Grade', 'Roll Number', 'Parent Contact', 'Address', 'ID Proof URL', 'Bus Route ID',
       'Date of Birth', 'Gender', 'Blood Group', 'Nationality', 'Religion',
       'Student Phone', 'Parent Name', 'Parent Email', 'Parent Phone', 'Parent Occupation', 'Emergency Contact', 'Emergency Phone',
       'Permanent Address', 'Temporary Address', 'City', 'State', 'Pincode',
       'Previous School', 'Previous Grade', 'Admission Date', 'Admission Number', 'Academic Year',
       'Medical Conditions', 'Allergies', 'Medications', 'Doctor Name', 'Doctor Phone',
       'Transport Required', 'Pickup Address', 'Drop Address',
       'Birth Certificate URL', 'Transfer Certificate URL', 'Mark Sheets URL', 'Medical Certificate URL', 'Passport Photo URL', 'Aadhar Card URL', 'Parent ID Proof URL', 'Other Documents URL'],
      // Sample Data Row
      ['John Doe', 'john@example.com', '10', 'Grade 5', 'STU001', '+1234567890', '123 Main St', 'https://example.com/id.pdf', 'route-a',
       '2014-05-15', 'Male', 'O+', 'Indian', 'Hindu',
       '+1234567891', 'Jane Doe', 'jane@example.com', '+1234567892', 'Teacher', 'Bob Doe', '+1234567893',
       '123 Main St', '123 Main St', 'Mumbai', 'Maharashtra', '400001',
       'ABC School', 'Grade 4', '2024-01-15', 'ADM001', '2024-25',
       'None', 'None', 'None', 'Dr. Smith', '+1234567894',
       'Yes', '123 Main St', '456 School St',
       'https://example.com/birth.pdf', 'https://example.com/transfer.pdf', 'https://example.com/marks.pdf', 'https://example.com/medical.pdf', 'https://example.com/photo.jpg', 'https://example.com/aadhar.pdf', 'https://example.com/parent_id.pdf', 'https://example.com/other.pdf']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Admission Template');
    XLSX.writeFile(wb, 'student_admission_template.csv');
  };

  const handleExcelVerification = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        toast.error('No data found in file');
        return;
      }

      // Verify each row
      const verificationResults = jsonData.map((row: any, index: number) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required field validation
        if (!row['Name']) errors.push('Name is required');
        if (!row['Age']) errors.push('Age is required');
        if (!row['Grade']) errors.push('Grade is required');
        if (!row['Parent Name']) errors.push('Parent Name is required');
        if (!row['Parent Email']) errors.push('Parent Email is required');
        if (!row['Parent Phone']) errors.push('Parent Phone is required');

        // Data type validation
        if (row['Age'] && isNaN(parseInt(row['Age']))) errors.push('Age must be a number');
        if (row['Parent Email'] && !row['Parent Email'].includes('@')) errors.push('Invalid email format');
        if (row['Date of Birth'] && isNaN(Date.parse(row['Date of Birth']))) errors.push('Invalid date format');

        // Document URL validation
        const documentFields = ['Birth Certificate URL', 'ID Proof URL', 'Previous School Certificate URL', 'Medical Certificate URL', 'Passport Photo URL', 'Parent ID Proof URL'];
        documentFields.forEach(field => {
          if (row[field] && !row[field].startsWith('http')) {
            warnings.push(`${field} should be a valid URL`);
          }
        });

        return {
          row: index + 2,
          data: row,
          errors,
          warnings,
          isValid: errors.length === 0
        };
      });

      setExcelVerificationData(verificationResults);
      setShowVerification(true);

      const validRows = verificationResults.filter(r => r.isValid).length;
      const totalRows = verificationResults.length;
      
      toast.success(`Verification complete: ${validRows}/${totalRows} rows are valid`);
    } catch (error) {
      console.error('Error verifying Excel file:', error);
      toast.error('Error verifying Excel file');
    }
  };

  const fetchRecentAdmissions = useCallback(async (page = 1, search = '', field = 'name', status = 'all') => {
    setIsLoadingAdmissions(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        grade: selectedGrade,
        status: status
      });
      
      const response = await fetch(`/api/academic/recent-admissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecentApplications(data.admissions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
        setCurrentPage(data.pagination?.currentPage || page);
        
        // Update statistics from the response
        if (data.stats) {
          setAdmissionStats({
            approved: data.stats.approved || 0,
            pending: data.stats.pending || 0,
            underReview: data.stats.underReview || 0,
            rejected: data.stats.rejected || 0
          });
        }
      } else {
        console.error('Failed to fetch recent admissions');
        toast.error('Failed to fetch recent admissions');
      }
    } catch (error) {
      console.error('Error fetching recent admissions:', error);
      toast.error('Failed to fetch recent admissions');
    } finally {
      setIsLoadingAdmissions(false);
    }
  }, [selectedGrade]);

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

  // Fetch student details
  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/academic/students/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedStudent(data.student);
        setEditedStudent(data.student);
        setIsDialogOpen(true);
      } else {
        toast.error('Failed to fetch student details');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Error fetching student details');
    }
  };

  // Update student status
  const updateStudentStatus = async (studentId: string, status: string) => {
    try {
      // Map the status values to the format expected by the API
      const statusMap: { [key: string]: string } = {
        'PENDING': 'Pending',
        'UNDER_REVIEW': 'Under Review',
        'ACCEPTED': 'Accepted',
        'REJECTED': 'Rejected'
      };

      const apiStatus = statusMap[status] || status;

      const response = await fetch(`/api/academic/students/${studentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: apiStatus }),
      });

      if (response.ok) {
        toast.success('Student status updated successfully');
        // Update the student in the list
        setRecentApplications(prev => 
          prev.map(student => 
            String(student.id) === studentId ? { ...student, status } : student
          )
        );
        // Update selected student if it's the same
        if (selectedStudent && String(selectedStudent.id) === studentId) {
          setSelectedStudent((prev: any) => ({ ...prev, status }));
        }
        // Refresh the data to update statistics
        fetchRecentAdmissions(currentPage, searchTerm, searchField, statusFilter);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Error updating student status');
    }
  };

  useEffect(() => {
    fetchRecentAdmissions(1, '', 'name', 'all');
  }, [fetchRecentAdmissions]);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedGrade !== 'all' || statusFilter !== 'all') {
        fetchRecentAdmissions(1, searchTerm, searchField, statusFilter);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedGrade, statusFilter, searchField, fetchRecentAdmissions]);

  const renderContent = () => {
    switch (activeSubSection) {
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
                  
                  {/* Form Section Navigation */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('basic')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'basic'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Basic Info
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('personal')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'personal'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Personal
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('contact')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'contact'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('address')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'address'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('academic')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'academic'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Academic
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('medical')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'medical'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Medical
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('transport')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'transport'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Transport
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormSection('documents')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeFormSection === 'documents'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Documents
                      </button>
                    </div>
                  </div>

                  {/* Basic Information Section */}
                  {activeFormSection === 'basic' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter student's full name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
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
                      <Label htmlFor="parentContact">Parent Contact *</Label>
                      <Input
                        id="parentContact"
                        placeholder="Enter parent contact number"
                        value={studentForm.parentContact}
                        onChange={(e) => setStudentForm({...studentForm, parentContact: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Student's email address"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Required for sending important information to parents</p>
                    </div>
                    <div>
                      <Label htmlFor="aadharCard">Aadhar Card Document</Label>
                      <Input
                        id="aadharCard"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setStudentForm({...studentForm, aadharCard: e.target.files?.[0] || null})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload Aadhar card or other ID proof</p>
                    </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information Section */}
                  {activeFormSection === 'personal' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={studentForm.dateOfBirth}
                          onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={studentForm.gender}
                          onValueChange={(value) => setStudentForm({...studentForm, gender: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Select
                          value={studentForm.bloodGroup}
                          onValueChange={(value) => setStudentForm({...studentForm, bloodGroup: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                          id="nationality"
                          placeholder="Enter nationality"
                          value={studentForm.nationality}
                          onChange={(e) => setStudentForm({...studentForm, nationality: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="religion">Religion</Label>
                        <Input
                          id="religion"
                          placeholder="Enter religion"
                          value={studentForm.religion}
                          onChange={(e) => setStudentForm({...studentForm, religion: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Contact Information Section */}
                  {activeFormSection === 'contact' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentPhone">Student Phone</Label>
                        <Input
                          id="studentPhone"
                          placeholder="Student's phone number"
                          value={studentForm.studentPhone}
                          onChange={(e) => setStudentForm({...studentForm, studentPhone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentEmail">Parent Email *</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          placeholder="Parent's email address"
                          value={studentForm.parentEmail}
                          onChange={(e) => setStudentForm({...studentForm, parentEmail: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentPhone">Parent Phone *</Label>
                        <Input
                          id="parentPhone"
                          placeholder="Parent's phone number"
                          value={studentForm.parentPhone}
                          onChange={(e) => setStudentForm({...studentForm, parentPhone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentOccupation">Parent Occupation</Label>
                        <Input
                          id="parentOccupation"
                          placeholder="Parent's occupation"
                          value={studentForm.parentOccupation}
                          onChange={(e) => setStudentForm({...studentForm, parentOccupation: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          placeholder="Emergency contact name"
                          value={studentForm.emergencyContact}
                          onChange={(e) => setStudentForm({...studentForm, emergencyContact: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                        <Input
                          id="emergencyPhone"
                          placeholder="Emergency contact phone"
                          value={studentForm.emergencyPhone}
                          onChange={(e) => setStudentForm({...studentForm, emergencyPhone: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Address Information Section */}
                  {activeFormSection === 'address' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="permanentAddress">Permanent Address *</Label>
                        <Input
                          id="permanentAddress"
                          placeholder="Permanent address"
                          value={studentForm.permanentAddress}
                          onChange={(e) => setStudentForm({...studentForm, permanentAddress: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="temporaryAddress">Temporary Address</Label>
                        <Input
                          id="temporaryAddress"
                          placeholder="Temporary address (if different)"
                          value={studentForm.temporaryAddress}
                          onChange={(e) => setStudentForm({...studentForm, temporaryAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={studentForm.city}
                          onChange={(e) => setStudentForm({...studentForm, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="State"
                          value={studentForm.state}
                          onChange={(e) => setStudentForm({...studentForm, state: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          placeholder="Pincode"
                          value={studentForm.pincode}
                          onChange={(e) => setStudentForm({...studentForm, pincode: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Academic Information Section */}
                  {activeFormSection === 'academic' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="previousSchool">Previous School</Label>
                        <Input
                          id="previousSchool"
                          placeholder="Name of previous school"
                          value={studentForm.previousSchool}
                          onChange={(e) => setStudentForm({...studentForm, previousSchool: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="previousGrade">Previous Grade</Label>
                        <Input
                          id="previousGrade"
                          placeholder="Previous grade/class"
                          value={studentForm.previousGrade}
                          onChange={(e) => setStudentForm({...studentForm, previousGrade: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admissionDate">Admission Date</Label>
                        <Input
                          id="admissionDate"
                          type="date"
                          value={studentForm.admissionDate}
                          onChange={(e) => setStudentForm({...studentForm, admissionDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admissionNumber">Admission Number</Label>
                        <Input
                          id="admissionNumber"
                          placeholder="Auto-generated if empty"
                          value={studentForm.admissionNumber}
                          onChange={(e) => setStudentForm({...studentForm, admissionNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        <Input
                          id="academicYear"
                          placeholder="e.g., 2024-25"
                          value={studentForm.academicYear}
                          onChange={(e) => setStudentForm({...studentForm, academicYear: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Medical Information Section */}
                  {activeFormSection === 'medical' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medicalConditions">Medical Conditions</Label>
                        <Textarea
                          id="medicalConditions"
                          placeholder="Any medical conditions"
                          value={studentForm.medicalConditions}
                          onChange={(e) => setStudentForm({...studentForm, medicalConditions: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          placeholder="Any allergies"
                          value={studentForm.allergies}
                          onChange={(e) => setStudentForm({...studentForm, allergies: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="medications">Medications</Label>
                        <Textarea
                          id="medications"
                          placeholder="Current medications"
                          value={studentForm.medications}
                          onChange={(e) => setStudentForm({...studentForm, medications: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctorName">Doctor Name</Label>
                        <Input
                          id="doctorName"
                          placeholder="Family doctor name"
                          value={studentForm.doctorName}
                          onChange={(e) => setStudentForm({...studentForm, doctorName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctorPhone">Doctor Phone</Label>
                        <Input
                          id="doctorPhone"
                          placeholder="Doctor's phone number"
                          value={studentForm.doctorPhone}
                          onChange={(e) => setStudentForm({...studentForm, doctorPhone: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Transport Information Section */}
                  {activeFormSection === 'transport' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Transport Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="transportRequired"
                          checked={studentForm.transportRequired}
                          onChange={(e) => setStudentForm({...studentForm, transportRequired: e.target.checked})}
                          className="rounded"
                          aria-label="Transport Required"
                        />
                        <Label htmlFor="transportRequired">Transport Required</Label>
                      </div>
                      <div>
                        <Label htmlFor="pickupAddress">Pickup Address</Label>
                        <Input
                          id="pickupAddress"
                          placeholder="Pickup address"
                          value={studentForm.pickupAddress}
                          onChange={(e) => setStudentForm({...studentForm, pickupAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dropAddress">Drop Address</Label>
                        <Input
                          id="dropAddress"
                          placeholder="Drop address"
                          value={studentForm.dropAddress}
                          onChange={(e) => setStudentForm({...studentForm, dropAddress: e.target.value})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  {activeFormSection === 'documents' && (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birthCertificate">Birth Certificate</Label>
                        <Input
                          id="birthCertificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, birthCertificate: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="transferCertificate">Transfer Certificate</Label>
                        <Input
                          id="transferCertificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, transferCertificate: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="markSheets">Mark Sheets</Label>
                        <Input
                          id="markSheets"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, markSheets: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicalCertificate">Medical Certificate</Label>
                        <Input
                          id="medicalCertificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, medicalCertificate: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passportPhoto">Passport Photo</Label>
                        <Input
                          id="passportPhoto"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, passportPhoto: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentIdProof">Parent ID Proof</Label>
                        <Input
                          id="parentIdProof"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, parentIdProof: e.target.files?.[0] || null})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="otherDocuments">Other Documents</Label>
                        <Input
                          id="otherDocuments"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setStudentForm({...studentForm, otherDocuments: e.target.files?.[0] || null})}
                        />
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Navigation and Submit Buttons */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2">
                        {activeFormSection !== 'basic' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const sections: ('basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents')[] = ['basic', 'personal', 'contact', 'address', 'academic', 'medical', 'transport', 'documents'];
                              const currentIndex = sections.indexOf(activeFormSection);
                              if (currentIndex > 0) {
                                setActiveFormSection(sections[currentIndex - 1] as 'basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents');
                              }
                            }}
                          >
                            ← Previous
                          </Button>
                        )}
                        {activeFormSection !== 'documents' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const sections: ('basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents')[] = ['basic', 'personal', 'contact', 'address', 'academic', 'medical', 'transport', 'documents'];
                              const currentIndex = sections.indexOf(activeFormSection);
                              if (currentIndex < sections.length - 1) {
                                setActiveFormSection(sections[currentIndex + 1] as 'basic' | 'personal' | 'contact' | 'address' | 'academic' | 'medical' | 'transport' | 'documents');
                              }
                            }}
                          >
                            Next →
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Section {['basic', 'personal', 'contact', 'address', 'academic', 'medical', 'transport', 'documents'].indexOf(activeFormSection) + 1} of 8
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Enrolling...' : 'Enroll Student'}
                    </Button>
                  </div>
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
                        onChange={handleExcelVerification}
                        className="hidden"
                        id="excel-verify"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="excel-verify" className="cursor-pointer">
                          <Search className="h-4 w-4 mr-2" />
                          Verify Excel
                        </label>
                      </Button>
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleStudentBatchUpload}
                        className="hidden"
                        id="student-batch-upload"
                      />
                      <Button asChild disabled={loading}>
                        <label htmlFor="student-batch-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {loading ? 'Uploading...' : 'Upload File'}
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Name, Age, Grade, Address</li>
                    <li>• Parent Name, Parent Email, Parent Phone</li>
                  </ul>
                  <h4 className="font-medium text-blue-900 mb-2 mt-3">Optional Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Personal Info: Date of Birth, Gender, Blood Group, Nationality, Religion</li>
                    <li>• Contact: Student Phone, Parent Occupation, Emergency Contact</li>
                    <li>• Academic: Previous School, Previous Grade, Admission Details</li>
                    <li>• Medical: Medical Conditions, Allergies, Medications, Doctor Info</li>
                    <li>• Transport: Transport Required, Pickup/Drop Address</li>
                    <li>• Documents: All document URLs (Birth Certificate, ID Proof, etc.)</li>
                    <li>• Valid Bus Route IDs: route-a, route-b, route-c (or leave empty)</li>
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
                      <Button asChild disabled={loading}>
                        <label htmlFor="batch-upload-file" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {loading ? 'Uploading...' : 'Upload File'}
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: .csv, .xlsx, .xls</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Required Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Name, Age, Grade, Address</li>
                    <li>• Parent Name, Parent Email, Parent Phone</li>
                  </ul>
                  <h4 className="font-medium text-blue-900 mb-2 mt-3">Optional Fields:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Personal Info: Date of Birth, Gender, Blood Group, Nationality, Religion</li>
                    <li>• Contact: Student Phone, Parent Occupation, Emergency Contact</li>
                    <li>• Academic: Previous School, Previous Grade, Admission Details</li>
                    <li>• Medical: Medical Conditions, Allergies, Medications, Doctor Info</li>
                    <li>• Transport: Transport Required, Pickup/Drop Address</li>
                    <li>• Documents: All document URLs (Birth Certificate, ID Proof, etc.)</li>
                    <li>• Valid Bus Route IDs: route-a, route-b, route-c (or leave empty)</li>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="searchField">Search Field</Label>
                    <Select value={searchField} onValueChange={setSearchField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="grade">Grade</SelectItem>
                        <SelectItem value="parentName">Parent Name</SelectItem>
                        <SelectItem value="parentEmail">Parent Email</SelectItem>
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradeFilter">Grade Filter</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="1">Grade 1</SelectItem>
                        <SelectItem value="2">Grade 2</SelectItem>
                        <SelectItem value="3">Grade 3</SelectItem>
                        <SelectItem value="4">Grade 4</SelectItem>
                        <SelectItem value="5">Grade 5</SelectItem>
                        <SelectItem value="6">Grade 6</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statusFilter">Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleSearch} className="flex-1">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSearchField('name');
                        setSelectedGrade('all');
                        setStatusFilter('all');
                        fetchRecentAdmissions(1, '', 'name', 'all');
                      }}
                    >
                      <Filter className="h-4 w-4" />
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
                          <Select
                            value={application.status}
                            onValueChange={(newStatus) => updateStudentStatus(application.id.toString(), newStatus)}
                          >
                            <SelectTrigger className="w-36">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  application.status === 'PENDING' ? 'bg-yellow-500' :
                                  application.status === 'UNDER_REVIEW' ? 'bg-blue-500' :
                                  application.status === 'ACCEPTED' ? 'bg-green-500' :
                                  application.status === 'REJECTED' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                  <span>Pending</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="UNDER_REVIEW">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span>Under Review</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ACCEPTED">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span>Accepted</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="REJECTED">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  <span>Rejected</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fetchStudentDetails(application.id.toString())}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} students
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
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
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

            {/* Admission Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-mediu text-gray-500">Approved</p>
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <X className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {admissionStats.rejected}
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
              <h2 className="text-2xl font-bold text-gray-900">Admissions Management</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      
      {/* Student Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details
            </DialogTitle>
            <DialogDescription>
              View and manage student information
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Header with Status and Actions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">Grade {selectedStudent.grade} • {selectedStudent.admissionNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      selectedStudent.status === 'ACCEPTED' ? 'default' : 
                      selectedStudent.status === 'PENDING' ? 'secondary' : 
                      selectedStudent.status === 'UNDER_REVIEW' ? 'outline' :
                      'destructive'
                    }
                  >
                    {selectedStudent.status === 'ACCEPTED' ? 'Accepted' :
                     selectedStudent.status === 'PENDING' ? 'Pending' :
                     selectedStudent.status === 'UNDER_REVIEW' ? 'Under Review' :
                     selectedStudent.status === 'REJECTED' ? 'Rejected' :
                     selectedStudent.status || 'Pending'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Grade</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.grade}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Age</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.age}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <p className="text-sm text-gray-600">
                        {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.gender || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Student Email</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Student Phone</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.studentPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Parent Name</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.parentName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Parent Email</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.parentEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Parent Phone</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.parentContact || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Academic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Admission Number</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.admissionNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Roll Number</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.rollNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Admission Date</Label>
                      <p className="text-sm text-gray-600">
                        {selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Previous School</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.previousSchool || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.address || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.state || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Pincode</Label>
                      <p className="text-sm text-gray-600">{selectedStudent.pincode || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedStudent.status === 'PENDING' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStudentStatus(selectedStudent.id, 'Pending')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pending
                    </Button>
                    <Button
                      variant={selectedStudent.status === 'UNDER_REVIEW' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStudentStatus(selectedStudent.id, 'Under Review')}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Under Review
                    </Button>
                    <Button
                      variant={selectedStudent.status === 'ACCEPTED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStudentStatus(selectedStudent.id, 'Accepted')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepted
                    </Button>
                    <Button
                      variant={selectedStudent.status === 'REJECTED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStudentStatus(selectedStudent.id, 'Rejected')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
