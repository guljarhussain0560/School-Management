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
  Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload,
  School, Globe, Settings, CheckCircle, Database, Shield, 
  FileText, Calendar, Users, Building, MapPin, Phone, Mail,
  AlertCircle, Clock, Award, BookOpen, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';
import ValidatedForm from '../common/ValidatedForm';

interface SchoolProfile {
  id: string;
  schoolName: string;
  schoolCode: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  establishedYear: number;
  affiliation: string;
  board: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  logo?: string;
  motto?: string;
  vision?: string;
  mission?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SchoolSettings {
  id: string;
  academicYear: string;
  sessionStart: string;
  sessionEnd: string;
  workingDays: string[];
  schoolTimings: {
    start: string;
    end: string;
  };
  breakTimings: {
    start: string;
    end: string;
  };
  attendanceSettings: {
    minimumAttendance: number;
    lateArrivalTime: string;
  };
  feeSettings: {
    lateFeeAmount: number;
    lateFeeDays: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  systemSettings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
}

const SchoolManagement: React.FC = () => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchSchoolProfile();
    fetchSchoolSettings();
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/school/profile');
      if (response.ok) {
        const data = await response.json();
        setSchoolProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching school profile:', error);
      toast.error('Failed to fetch school profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolSettings = async () => {
    try {
      const response = await fetch('/api/school/settings');
      if (response.ok) {
        const data = await response.json();
        setSchoolSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching school settings:', error);
      toast.error('Failed to fetch school settings');
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      const response = await fetch('/api/school/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('School profile updated successfully');
        setShowProfileDialog(false);
        fetchSchoolProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update school profile');
      }
    } catch (error) {
      console.error('Error updating school profile:', error);
      toast.error('Failed to update school profile');
    }
  };

  const handleUpdateSettings = async (data: any) => {
    try {
      const response = await fetch('/api/school/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('School settings updated successfully');
        setShowSettingsDialog(false);
        fetchSchoolSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update school settings');
      }
    } catch (error) {
      console.error('Error updating school settings:', error);
      toast.error('Failed to update school settings');
    }
  };

  const handleComplianceAction = (action: string) => {
    toast.info(`${action} feature coming soon`);
  };

  const handleSystemConfigAction = (action: string) => {
    toast.info(`${action} feature coming soon`);
  };

  const profileFields = [
    { name: 'schoolName', label: 'School Name', type: 'text' as const, required: true, placeholder: 'Enter school name' },
    { name: 'schoolCode', label: 'School Code', type: 'text' as const, required: true, placeholder: 'SCH001' },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: true, placeholder: 'Enter school address' },
    { name: 'city', label: 'City', type: 'text' as const, required: true, placeholder: 'Enter city' },
    { name: 'state', label: 'State', type: 'text' as const, required: true, placeholder: 'Enter state' },
    { name: 'pincode', label: 'Pincode', type: 'text' as const, required: true, placeholder: '123456' },
    { name: 'country', label: 'Country', type: 'text' as const, required: true, placeholder: 'Enter country' },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: true, placeholder: '9876543210' },
    { name: 'email', label: 'Email', type: 'email' as const, required: true, placeholder: 'school@example.com' },
    { name: 'website', label: 'Website', type: 'text' as const, required: false, placeholder: 'https://school.com' },
    { name: 'establishedYear', label: 'Established Year', type: 'number' as const, required: true, placeholder: '2000' },
    { name: 'affiliation', label: 'Affiliation', type: 'text' as const, required: true, placeholder: 'CBSE/ICSE/State Board' },
    { name: 'board', label: 'Board', type: 'text' as const, required: true, placeholder: 'Educational Board' },
    { name: 'principalName', label: 'Principal Name', type: 'text' as const, required: true, placeholder: 'Enter principal name' },
    { name: 'principalEmail', label: 'Principal Email', type: 'email' as const, required: true, placeholder: 'principal@school.com' },
    { name: 'principalPhone', label: 'Principal Phone', type: 'text' as const, required: true, placeholder: '9876543210' },
    { name: 'motto', label: 'School Motto', type: 'text' as const, required: false, placeholder: 'Enter school motto' },
    { name: 'vision', label: 'Vision', type: 'textarea' as const, required: false, placeholder: 'Enter school vision' },
    { name: 'mission', label: 'Mission', type: 'textarea' as const, required: false, placeholder: 'Enter school mission' }
  ];

  const settingsFields = [
    { name: 'academicYear', label: 'Academic Year', type: 'text' as const, required: true, placeholder: '2024-25' },
    { name: 'sessionStart', label: 'Session Start Date', type: 'date' as const, required: true },
    { name: 'sessionEnd', label: 'Session End Date', type: 'date' as const, required: true },
    { name: 'schoolStartTime', label: 'School Start Time', type: 'text' as const, required: true, placeholder: '08:00' },
    { name: 'schoolEndTime', label: 'School End Time', type: 'text' as const, required: true, placeholder: '15:00' },
    { name: 'breakStartTime', label: 'Break Start Time', type: 'text' as const, required: true, placeholder: '12:00' },
    { name: 'breakEndTime', label: 'Break End Time', type: 'text' as const, required: true, placeholder: '12:30' },
    { name: 'minimumAttendance', label: 'Minimum Attendance %', type: 'number' as const, required: true, placeholder: '75' },
    { name: 'lateArrivalTime', label: 'Late Arrival Time', type: 'text' as const, required: true, placeholder: '08:15' },
    { name: 'lateFeeAmount', label: 'Late Fee Amount', type: 'number' as const, required: true, placeholder: '100' },
    { name: 'lateFeeDays', label: 'Late Fee Days', type: 'number' as const, required: true, placeholder: '5' },
    { name: 'timezone', label: 'Timezone', type: 'select' as const, required: true, 
      options: [
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
        { value: 'America/New_York', label: 'America/New_York (EST)' },
        { value: 'Europe/London', label: 'Europe/London (GMT)' }
      ]
    },
    { name: 'dateFormat', label: 'Date Format', type: 'select' as const, required: true,
      options: [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
      ]
    },
    { name: 'currency', label: 'Currency', type: 'select' as const, required: true,
      options: [
        { value: 'INR', label: 'Indian Rupee (INR)' },
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'AED', label: 'UAE Dirham (AED)' }
      ]
    },
    { name: 'language', label: 'Language', type: 'select' as const, required: true,
      options: [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'ar', label: 'Arabic' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">School Management</h2>
          <p className="text-gray-600">Manage school profile, settings, and system configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="settings">School Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system-config">System Config</TabsTrigger>
        </TabsList>

        {/* School Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>School Profile</CardTitle>
                  <CardDescription>Basic information about your school</CardDescription>
                </div>
                <Button onClick={() => setShowProfileDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : schoolProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>School Name</Label>
                      <p className="text-sm text-gray-600">{schoolProfile.schoolName}</p>
                    </div>
                    <div>
                      <Label>School Code</Label>
                      <p className="text-sm text-gray-600">{schoolProfile.schoolCode}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="text-sm text-gray-600">{schoolProfile.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <p className="text-sm text-gray-600">{schoolProfile.city}</p>
                      </div>
                      <div>
                        <Label>State</Label>
                        <p className="text-sm text-gray-600">{schoolProfile.state}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pincode</Label>
                        <p className="text-sm text-gray-600">{schoolProfile.pincode}</p>
                      </div>
                      <div>
                        <Label>Country</Label>
                        <p className="text-sm text-gray-600">{schoolProfile.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Contact Information</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{schoolProfile.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{schoolProfile.email}</span>
                        </div>
                        {schoolProfile.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{schoolProfile.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Academic Information</Label>
                      <div className="space-y-2 mt-2">
                        <div>
                          <span className="text-sm font-medium">Established:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.establishedYear}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Board:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.board}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Affiliation:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.affiliation}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Principal Information</Label>
                      <div className="space-y-2 mt-2">
                        <div>
                          <span className="text-sm font-medium">Name:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.principalName}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.principalEmail}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="text-sm text-gray-600 ml-2">{schoolProfile.principalPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No school profile found</p>
                  <Button onClick={() => setShowProfileDialog(true)} className="mt-4">
                    Create Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>School Settings</CardTitle>
                  <CardDescription>Configure academic and operational settings</CardDescription>
                </div>
                <Button onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schoolSettings ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Academic Year Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Year</Label>
                        <p className="text-sm text-gray-600">{schoolSettings.academicYear}</p>
                      </div>
                      <div>
                        <Label>Session Period</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(schoolSettings.sessionStart).toLocaleDateString()} - {new Date(schoolSettings.sessionEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Timing Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>School Timings</Label>
                        <p className="text-sm text-gray-600">
                          {schoolSettings.schoolTimings.start} - {schoolSettings.schoolTimings.end}
                        </p>
                      </div>
                      <div>
                        <Label>Break Timings</Label>
                        <p className="text-sm text-gray-600">
                          {schoolSettings.breakTimings.start} - {schoolSettings.breakTimings.end}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Timezone</Label>
                        <p className="text-sm text-gray-600">{schoolSettings.systemSettings.timezone}</p>
                      </div>
                      <div>
                        <Label>Date Format</Label>
                        <p className="text-sm text-gray-600">{schoolSettings.systemSettings.dateFormat}</p>
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <p className="text-sm text-gray-600">{schoolSettings.systemSettings.currency}</p>
                      </div>
                      <div>
                        <Label>Language</Label>
                        <p className="text-sm text-gray-600">{schoolSettings.systemSettings.language}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No settings configured</p>
                  <Button onClick={() => setShowSettingsDialog(true)} className="mt-4">
                    Configure Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Reports</CardTitle>
              <CardDescription>Manage regulatory compliance and generate reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleComplianceAction('Regulatory Compliance')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Regulatory Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Track and manage regulatory requirements</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleComplianceAction('Audit Reports')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Audit Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Generate audit and compliance reports</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleComplianceAction('Certifications')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Manage school certifications and accreditations</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Config Tab */}
        <TabsContent value="system-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Advanced system configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSystemConfigAction('Database Management')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Database Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Database backup, restore, and maintenance</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSystemConfigAction('User Management')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">System users, roles, and permissions</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSystemConfigAction('System Analytics')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      System Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">System performance and usage analytics</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit School Profile</DialogTitle>
            <DialogDescription>
              Update your school's basic information and details
            </DialogDescription>
          </DialogHeader>
          <FormWithExcel
            title="School Profile"
            fields={profileFields}
            templateKey="schoolProfile"
            onSubmit={handleUpdateProfile}
            initialData={schoolProfile || {}}
            submitButtonText="Update Profile"
            showExcelFeatures={false}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Edit Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure School Settings</DialogTitle>
            <DialogDescription>
              Update academic and operational settings
            </DialogDescription>
          </DialogHeader>
          
          <ValidatedForm
            fields={settingsFields}
            initialData={{
              academicYear: schoolSettings?.academicYear || '2024-25',
              sessionStart: schoolSettings?.sessionStart || '2024-04-01',
              sessionEnd: schoolSettings?.sessionEnd || '2025-03-31',
              schoolStartTime: schoolSettings?.schoolTimings?.start || '08:00',
              schoolEndTime: schoolSettings?.schoolTimings?.end || '15:00',
              breakStartTime: schoolSettings?.breakTimings?.start || '12:00',
              breakEndTime: schoolSettings?.breakTimings?.end || '12:30',
              minimumAttendance: schoolSettings?.attendanceSettings?.minimumAttendance || 75,
              lateArrivalTime: schoolSettings?.attendanceSettings?.lateArrivalTime || '08:15',
              lateFeeAmount: schoolSettings?.feeSettings?.lateFeeAmount || 100,
              lateFeeDays: schoolSettings?.feeSettings?.lateFeeDays || 5,
              timezone: schoolSettings?.systemSettings?.timezone || 'Asia/Kolkata',
              dateFormat: schoolSettings?.systemSettings?.dateFormat || 'DD/MM/YYYY',
              currency: schoolSettings?.systemSettings?.currency || 'INR',
              language: schoolSettings?.systemSettings?.language || 'en'
            }}
            onSubmit={handleUpdateSettings}
            submitText="Save Settings"
            className="space-y-4"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement;
