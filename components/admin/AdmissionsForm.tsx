'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, FileSpreadsheet, GraduationCap, Upload, Download, 
  CheckCircle, Clock, AlertCircle, Eye, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

const AdmissionsForm = () => {
  const [loading, setLoading] = useState(false);
  
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
  const recentApplications = [
    { id: 1, name: 'Emma Wilson', grade: 'Grade 5', enrolledDate: '2024-01-15', status: 'Pending' },
    { id: 2, name: 'Jack Brown', grade: 'Grade 3', enrolledDate: '2024-01-14', status: 'Approved' },
    { id: 3, name: 'Sophia Davis', grade: 'Grade 7', enrolledDate: '2024-01-13', status: 'Under Review' }
  ];

  const admissionStats = {
    approved: 12,
    pending: 5,
    underReview: 3
  };

  const grades = Array.from({length: 12}, (_, i) => (i + 1).toString());

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/academic/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentForm.fullName,
          age: parseInt(studentForm.age),
          grade: studentForm.grade,
          rollNumber: `STU${Date.now()}`,
          parentContact: studentForm.contactNumber,
          address: studentForm.address,
          email: studentForm.emailAddress
        })
      });

      if (response.ok) {
        toast.success('Student profile created successfully');
        setStudentForm({
          fullName: '', age: '', grade: '', address: '',
          parentName: '', contactNumber: '', emailAddress: '', idProof: null
        });
      } else {
        toast.error('Failed to create student profile');
      }
    } catch (error) {
      toast.error('Error creating student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info('Batch upload functionality will be implemented');
    }
  };

  const downloadStudentTemplate = () => {
    const templateData = [
      ['Full Name', 'Age', 'Grade', 'Address', 'Parent/Guardian Name', 'Contact Number', 'Email Address'],
      ['John Doe', '10', '5', '123 Main St', 'Jane Doe', '+1234567890', 'john@example.com'],
      ['Jane Smith', '11', '6', '456 Oak Ave', 'Bob Smith', '+1234567891', 'jane@example.com']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_admission_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleApplicationAction = (applicationId: number, action: string) => {
    toast.info(`${action} action for application ${applicationId} will be implemented`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Onboarding Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Onboarding Form
          </CardTitle>
          <CardDescription>Add new student information to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            {/* Student Information */}
            <div>
              <h4 className="font-semibold mb-4">Student Information</h4>
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
                    placeholder="Age"
                    value={studentForm.age}
                    onChange={(e) => setStudentForm({...studentForm, age: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={studentForm.grade} onValueChange={(value) => setStudentForm({...studentForm, grade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Home address"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div>
              <h4 className="font-semibold mb-4">Parent/Guardian Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    type="tel"
                    placeholder="Phone number"
                    value={studentForm.contactNumber}
                    onChange={(e) => setStudentForm({...studentForm, contactNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    placeholder="Email address"
                    value={studentForm.emailAddress}
                    onChange={(e) => setStudentForm({...studentForm, emailAddress: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* ID Proof Upload */}
            <div>
              <h4 className="font-semibold mb-4">ID Proof Upload</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload ID Proof</h3>
                <p className="text-gray-600 mb-4">Birth certificate, passport, or ID card</p>
                <div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setStudentForm({...studentForm, idProof: e.target.files?.[0] || null})}
                    className="hidden"
                    id="id-proof-upload"
                  />
                  <Button asChild>
                    <label htmlFor="id-proof-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </label>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Accepted: .pdf, .jpg, .jpeg, .png</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Student Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Batch Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Batch Upload
          </CardTitle>
          <CardDescription>Import multiple student records from spreadsheet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Student Data</h3>
            <p className="text-gray-600 mb-4">CSV or Excel file with student information</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={downloadStudentTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleBatchUpload}
                  className="hidden"
                  id="batch-upload"
                />
                <Button asChild>
                  <label htmlFor="batch-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </label>
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Accepted: .csv, .xlsx, .xls</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Admissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Recent Admissions
          </CardTitle>
          <CardDescription>View and manage recently enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* New Student Applications */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">New Student Applications</h4>
                <span className="text-sm text-gray-600">{recentApplications.length} applications</span>
              </div>
              
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{application.name}</div>
                      <div className="text-sm text-gray-600">
                        {application.grade} • Enrolled: {application.enrolledDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === 'Pending' && (
                        <>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleApplicationAction(application.id, 'Review')}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" onClick={() => handleApplicationAction(application.id, 'Approve')}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                      {application.status === 'Approved' && (
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      )}
                      {application.status === 'Under Review' && (
                        <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{admissionStats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{admissionStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{admissionStats.underReview}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionsForm;
