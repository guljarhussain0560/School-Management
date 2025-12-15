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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Edit, Trash2, Search, Filter, Calendar, 
  Users, BookOpen, GraduationCap, CheckCircle, XCircle, Clock, 
  AlertCircle, Info, Eye, Settings, Layers
} from 'lucide-react';
import { toast } from 'sonner';

interface Grade {
  id: string;
  gradeCode: string;
  gradeName: string;
  gradeLevel: number;
  description?: string;
  isActive: boolean;
  batch: {
    id: string;
    batchName: string;
    academicYear: string;
  };
  sections: Section[];
  _count: {
    sections: number;
    subjects: number;
  };
}

interface Section {
  id: string;
  classCode: string;
  sectionName: string;
  sectionType: 'LETTER' | 'COLOR' | 'NUMBER';
  description?: string;
  capacity: number;
  isActive: boolean;
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
  _count: {
    students: number;
  };
}

interface StudentBatch {
  id: string;
  batchName: string;
  academicYear: string;
  status: string;
}

export default function SectionManagement() {
  // State for grades
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    gradeName: '',
    gradeLevel: '',
    description: '',
    batchId: ''
  });
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  // State for sections
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    sectionName: '',
    sectionType: 'LETTER' as 'LETTER' | 'COLOR' | 'NUMBER',
    description: '',
    capacity: 30,
    gradeId: '',
    batchId: ''
  });
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // State for batches
  const [batches, setBatches] = useState<StudentBatch[]>([]);

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBatches();
    fetchGrades();
    fetchSections();
  }, [currentPage, searchTerm, selectedBatch, selectedGrade]);

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

  const fetchGrades = async () => {
    try {
      setIsLoadingGrades(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        batchId: selectedBatch,
        search: searchTerm
      });

      const response = await fetch(`/api/academic/grades?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch grades');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Error fetching grades');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const fetchSections = async () => {
    try {
      setIsLoadingSections(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        batchId: selectedBatch,
        gradeId: selectedGrade,
        search: searchTerm
      });

      const response = await fetch(`/api/academic/sections?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Error fetching sections');
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gradeForm.gradeName || !gradeForm.gradeLevel || !gradeForm.batchId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/academic/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeForm)
      });

      if (response.ok) {
        toast.success('Grade created successfully');
        setIsGradeDialogOpen(false);
        setGradeForm({
          gradeName: '',
          gradeLevel: '',
          description: '',
          batchId: ''
        });
        fetchGrades();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create grade');
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      toast.error('Error creating grade');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionForm.sectionName || !sectionForm.gradeId || !sectionForm.batchId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/academic/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionForm)
      });

      if (response.ok) {
        toast.success('Section created successfully');
        setIsSectionDialogOpen(false);
        setSectionForm({
          sectionName: '',
          sectionType: 'LETTER',
          description: '',
          capacity: 30,
          gradeId: '',
          batchId: ''
        });
        fetchSections();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Error creating section');
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade? This will also delete all sections in this grade.')) return;

    try {
      const response = await fetch(`/api/academic/grades/${gradeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Grade deleted successfully');
        fetchGrades();
        fetchSections();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete grade');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast.error('Error deleting grade');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? This will also remove all students from this section.')) return;

    try {
      const response = await fetch(`/api/academic/classes/${sectionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Section deleted successfully');
        fetchSections();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Error deleting section');
    }
  };

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'LETTER': return 'bg-blue-100 text-blue-800';
      case 'COLOR': return 'bg-green-100 text-green-800';
      case 'NUMBER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case 'LETTER': return 'A';
      case 'COLOR': return '🎨';
      case 'NUMBER': return '1';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Section Management</h2>
          <p className="text-gray-600">Manage grades and sections within academic batches</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsGradeDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Grade
          </Button>
          <Button onClick={() => setIsSectionDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Section
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How Section Management Works:</strong> Create grades (e.g., Grade 1, Grade 2) within batches, then create sections (A, B, C or Green, Purple, Orange) within each grade. Students are assigned to specific sections during admission.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Layers className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sections</p>
                <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sections.reduce((sum, section) => sum + section._count.students, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search grades and sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-full sm:w-48">
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
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by grade" />
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
        </CardContent>
      </Card>

      {/* Tabs for Grades and Sections */}
      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Grades</CardTitle>
              <CardDescription>
                Manage grades within academic batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGrades ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade Name</TableHead>
                        <TableHead>Grade Code</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Sections</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">{grade.gradeName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{grade.gradeCode}</Badge>
                          </TableCell>
                          <TableCell>{grade.gradeLevel}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{grade.batch.batchName}</p>
                              <p className="text-sm text-gray-600">{grade.batch.academicYear}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Layers className="h-4 w-4 text-gray-400" />
                              {grade._count.sections}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={grade.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {grade.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Sections</CardTitle>
              <CardDescription>
                Manage sections within grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSections ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.map((section) => (
                        <TableRow key={section.id}>
                          <TableCell className="font-medium">{section.sectionName}</TableCell>
                          <TableCell>
                            <Badge className={getSectionTypeColor(section.sectionType)}>
                              {getSectionTypeIcon(section.sectionType)} {section.sectionType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{section.grade.gradeName}</p>
                              <p className="text-sm text-gray-600">{section.grade.gradeCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{section.batch.batchName}</p>
                              <p className="text-sm text-gray-600">{section.batch.academicYear}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              {section._count.students}
                            </div>
                          </TableCell>
                          <TableCell>{section.capacity}</TableCell>
                          <TableCell>
                            <Badge className={section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {section.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSection(section.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Grade</DialogTitle>
            <DialogDescription>
              Create a new grade within an academic batch
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradeName">Grade Name *</Label>
                <Input
                  id="gradeName"
                  value={gradeForm.gradeName}
                  onChange={(e) => setGradeForm({...gradeForm, gradeName: e.target.value})}
                  placeholder="e.g., Grade 1, Grade 2, Nursery"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Grade Level *</Label>
                <Input
                  id="gradeLevel"
                  type="number"
                  value={gradeForm.gradeLevel}
                  onChange={(e) => setGradeForm({...gradeForm, gradeLevel: e.target.value})}
                  placeholder="e.g., 1, 2, 3"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batchId">Academic Batch *</Label>
              <Select value={gradeForm.batchId} onValueChange={(value) => setGradeForm({...gradeForm, batchId: value})}>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={gradeForm.description}
                onChange={(e) => setGradeForm({...gradeForm, description: e.target.value})}
                placeholder="Optional description for this grade"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Grade</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Create a new section within a grade
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={sectionForm.sectionName}
                  onChange={(e) => setSectionForm({...sectionForm, sectionName: e.target.value})}
                  placeholder="e.g., A, B, C, Green, Purple"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sectionType">Section Type *</Label>
                <Select value={sectionForm.sectionType} onValueChange={(value: any) => setSectionForm({...sectionForm, sectionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LETTER">Letter (A, B, C)</SelectItem>
                    <SelectItem value="COLOR">Color (Green, Purple, Orange)</SelectItem>
                    <SelectItem value="NUMBER">Number (1, 2, 3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradeId">Grade *</Label>
                <Select value={sectionForm.gradeId} onValueChange={(value) => setSectionForm({...sectionForm, gradeId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.gradeName} ({grade.batch.batchName})
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
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({...sectionForm, capacity: parseInt(e.target.value)})}
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sectionDescription">Description</Label>
              <Textarea
                id="sectionDescription"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({...sectionForm, description: e.target.value})}
                placeholder="Optional description for this section"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Section</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
