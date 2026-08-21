'use client'

import { logger } from '@/lib/logger'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, Filter, Download, Users, BookOpen, GraduationCap, 
  CheckCircle, XCircle, Clock, AlertCircle, Info, Eye, 
  FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  age: number;
  rollNumber: string;
  parentContact?: string;
  status: string;
  admissionDate?: string;
  class: {
    id: string;
    sectionName: string;
    sectionType: string;
    classCode: string;
    grade: {
      id: string;
      gradeName: string;
      gradeCode: string;
      gradeLevel: number;
    };
    batch: {
      id: string;
      batchName: string;
      academicYear: string;
    };
  };
}

interface StudentBatch {
  id: string;
  batchName: string;
  academicYear: string;
  status: string;
}

interface Grade {
  id: string;
  gradeName: string;
  gradeCode: string;
  gradeLevel: number;
  batch: {
    id: string;
    batchName: string;
  };
}

interface Section {
  id: string;
  sectionName: string;
  sectionType: string;
  classCode: string;
  grade: {
    id: string;
    gradeName: string;
  };
  batch: {
    id: string;
    batchName: string;
  };
}

export default function AdvancedStudentSearch() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    batchId: 'all',
    gradeId: 'all',
    sectionId: 'all',
    status: 'all'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (searchFilters.batchId !== 'all') {
      fetchGrades();
    } else {
      setGrades([]);
      setSections([]);
    }
  }, [searchFilters.batchId]);

  useEffect(() => {
    if (searchFilters.gradeId !== 'all') {
      fetchSections();
    } else {
      setSections([]);
    }
  }, [searchFilters.gradeId]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/academic/student-batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      logger.error('Error fetching batches:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams({
        batchId: searchFilters.batchId,
        limit: '100'
      });
      const response = await fetch(`/api/academic/grades?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
      }
    } catch (error) {
      logger.error('Error fetching grades:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const params = new URLSearchParams({
        gradeId: searchFilters.gradeId,
        limit: '100'
      });
      const response = await fetch(`/api/academic/sections?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      logger.error('Error fetching sections:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchFilters.searchTerm,
        batchId: searchFilters.batchId,
        gradeId: searchFilters.gradeId,
        sectionId: searchFilters.sectionId,
        status: searchFilters.status
      });

      const response = await fetch(`/api/academic/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      } else {
        toast.error('Failed to search students');
      }
    } catch (error) {
      logger.error('Error searching students:', error);
      toast.error('Error searching students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchFilters({
      searchTerm: '',
      batchId: 'all',
      gradeId: 'all',
      sectionId: 'all',
      status: 'all'
    });
    setStudents([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const exportResults = () => {
    if (students.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = students.map(student => ({
      'Student ID': student.studentId,
      'Name': student.name,
      'Email': student.email || 'N/A',
      'Age': student.age,
      'Roll Number': student.rollNumber,
      'Parent Contact': student.parentContact || 'N/A',
      'Status': student.status,
      'Admission Date': student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A',
      'Batch': student.class.batch.batchName,
      'Academic Year': student.class.batch.academicYear,
      'Grade': student.class.grade.gradeName,
      'Section': student.class.sectionName,
      'Section Type': student.class.sectionType,
      'Class Code': student.class.classCode
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student-search-results.xlsx');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SUSPENDED': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Student Search</h2>
          <p className="text-gray-600">Search students by batch, grade, section, and status</p>
        </div>
        <div className="flex gap-2">
          {hasSearched && students.length > 0 && (
            <Button variant="outline" onClick={exportResults} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
          )}
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Advanced Search:</strong> Use the filters below to search for students by batch, grade, section, or status. You can combine multiple filters for precise results.
        </AlertDescription>
      </Alert>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <CardDescription>
            Set your search criteria and click search to find students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="searchTerm">Search Term</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="searchTerm"
                  placeholder="Name, ID, roll number..."
                  value={searchFilters.searchTerm}
                  onChange={(e) => setSearchFilters({...searchFilters, searchTerm: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batchId">Academic Batch</Label>
              <Select value={searchFilters.batchId} onValueChange={(value) => setSearchFilters({...searchFilters, batchId: value, gradeId: 'all', sectionId: 'all'})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batchName} ({batch.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gradeId">Grade</Label>
              <Select 
                value={searchFilters.gradeId} 
                onValueChange={(value) => setSearchFilters({...searchFilters, gradeId: value, sectionId: 'all'})}
                disabled={searchFilters.batchId === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.gradeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sectionId">Section</Label>
              <Select 
                value={searchFilters.sectionId} 
                onValueChange={(value) => setSearchFilters({...searchFilters, sectionId: value})}
                disabled={searchFilters.gradeId === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.sectionName} ({section.grade.gradeName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={searchFilters.status} onValueChange={(value) => setSearchFilters({...searchFilters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Students
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Search Results
            </CardTitle>
            <CardDescription>
              Found {totalCount} student{totalCount !== 1 ? 's' : ''} matching your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found matching your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.class.batch.batchName}</p>
                            <p className="text-sm text-gray-600">{student.class.batch.academicYear}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.class.grade.gradeName}</p>
                            <p className="text-sm text-gray-600">{student.class.grade.gradeCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.class.sectionName}</p>
                            <Badge variant="outline" className="text-xs">
                              {student.class.sectionType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(student.status)}
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{student.parentContact || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
