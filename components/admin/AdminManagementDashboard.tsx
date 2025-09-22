'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, DollarSign, UserPlus, Building, 
  BarChart3, Calendar, FileText, BookOpen, 
  Users, Settings, AlertCircle, Menu, X, Briefcase,
  School, ClipboardList, TrendingUp, Shield, 
  Bus, Wrench, Bell, UserCheck, FileSpreadsheet,
  PieChart, LineChart, Database, Globe, Clock,
  Award, BookMarked, Calculator, Receipt, 
  MapPin, Car, AlertTriangle, CheckCircle,
  Plus, Edit, Trash2, Eye, Download, Upload
} from 'lucide-react';

// Import the new components
import AcademicManagementDashboard from './AcademicManagementDashboard';
import FinancialManagementDashboard from './FinancialManagementDashboard';
import AdmissionsManagementDashboard from './AdmissionsManagementDashboard';
import TransportManagementDashboard from './TransportManagementDashboard';
import EmployeeManagementDashboard from './EmployeeManagementDashboard';
import BatchManagementDashboard from './BatchManagementDashboard';
import DashboardOverview from '../dashboard/DashboardOverview';
import StudentManagement from '../student/StudentManagement';
import SchoolManagement from '../school/SchoolManagement';
import BatchManagement from '../academic/BatchManagement';

export default function AdminManagementDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  
  // Navigation state - track expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard']));
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeSubSection, setActiveSubSection] = useState('overview');

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
    
    // Set active section and first subsection when expanding
    if (newExpandedSections.has(sectionId)) {
      setActiveSection(sectionId);
      const section = navigationSections.find(s => s.id === sectionId);
      if (section && section.subSections.length > 0) {
        setActiveSubSection(section.subSections[0].id);
      }
    }
  };

  // Toggle all sections
  const toggleAllSections = () => {
    if (expandedSections.size === navigationSections.length) {
      // Collapse all
      setExpandedSections(new Set());
    } else {
      // Expand all
      setExpandedSections(new Set(navigationSections.map(s => s.id)));
    }
  };

  // Professional Navigation Structure
  const navigationSections = [
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      icon: BarChart3,
      subSections: [
        { id: 'overview', name: 'Analytics Overview', icon: TrendingUp },
        { id: 'quick-stats', name: 'Quick Statistics', icon: PieChart },
        { id: 'recent-activities', name: 'Recent Activities', icon: Clock }
      ]
    },
    {
      id: 'academic',
      name: 'Academic Management',
      icon: GraduationCap,
      subSections: [
        { id: 'performance', name: 'Student Performance', icon: Award },
        { id: 'attendance', name: 'Attendance Tracking', icon: Calendar },
        { id: 'assignments', name: 'Assignment Management', icon: FileText },
        { id: 'curriculum', name: 'Curriculum Planning', icon: BookOpen },
        { id: 'exams', name: 'Exam Management', icon: ClipboardList },
        { id: 'academic-calendar', name: 'Academic Calendar', icon: Calendar },
        { id: 'teacher-assignments', name: 'Teacher Assignments', icon: UserCheck },
        { id: 'academic-management', name: 'Academic Settings', icon: Settings }
      ]
    },
    {
      id: 'student-management',
      name: 'Student Management',
      icon: Users,
      subSections: [
        { id: 'class-management', name: 'Class Management', icon: School },
        { id: 'student-profiles', name: 'Student Profiles', icon: UserCheck },
        { id: 'student-reports', name: 'Student Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'batch-management',
      name: 'Batch Management',
      icon: Users,
      subSections: [
        { id: 'batch-overview', name: 'Batch Overview', icon: BarChart3 },
        { id: 'create-batch', name: 'Create Batch', icon: Plus },
        { id: 'assign-students', name: 'Assign Students', icon: UserCheck },
        { id: 'batch-reports', name: 'Batch Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Management',
      icon: DollarSign,
      subSections: [
        { id: 'fee-structures', name: 'Fee Structures', icon: Calculator },
        { id: 'fee-collections', name: 'Fee Collections', icon: Receipt },
        { id: 'student-fees', name: 'Student Fee Details', icon: Users },
        { id: 'payroll', name: 'Payroll Management', icon: Briefcase },
        { id: 'budget', name: 'Budget Management', icon: PieChart },
        { id: 'financial-reports', name: 'Financial Reports', icon: LineChart }
      ]
    },
    {
      id: 'transport',
      name: 'Transport & Operations',
      icon: Bus,
      subSections: [
        { id: 'bus-management', name: 'Bus Management', icon: Car },
        { id: 'route-management', name: 'Route Management', icon: MapPin },
        { id: 'operations-dashboard', name: 'Operations Dashboard', icon: Bus },
        { id: 'maintenance-log', name: 'Maintenance Log', icon: Wrench },
        { id: 'safety-alerts', name: 'Safety Alerts', icon: AlertTriangle },
        { id: 'transport-reports', name: 'Transport Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'employee',
      name: 'Employee Management',
      icon: Briefcase,
      subSections: [
        { id: 'employee-management', name: 'Employee Records', icon: Users },
        { id: 'user-management', name: 'User Management', icon: Shield },
        { id: 'payroll-integration', name: 'Payroll Integration', icon: Calculator },
        { id: 'employee-reports', name: 'Employee Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'admissions',
      name: 'Admissions',
      icon: UserPlus,
      subSections: [
        { id: 'student-onboarding', name: 'Student Onboarding', icon: UserPlus },
        { id: 'batch-upload', name: 'Batch Upload', icon: Upload },
        { id: 'recent-admissions', name: 'Recent Admissions', icon: Clock },
        { id: 'admission-reports', name: 'Admission Reports', icon: FileSpreadsheet }
      ]
    },
    {
      id: 'school-management',
      name: 'School Management',
      icon: School,
      subSections: [
        { id: 'school-profile', name: 'School Profile', icon: Globe },
        { id: 'school-settings', name: 'School Settings', icon: Settings },
        { id: 'compliance', name: 'Compliance & Reports', icon: CheckCircle },
        { id: 'system-config', name: 'System Configuration', icon: Database }
      ]
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      icon: FileSpreadsheet,
      subSections: [
        { id: 'academic-reports', name: 'Academic Reports', icon: BookMarked },
        { id: 'financial-reports', name: 'Financial Reports', icon: DollarSign },
        { id: 'operational-reports', name: 'Operational Reports', icon: Bus },
        { id: 'system-reports', name: 'System Reports', icon: Database },
        { id: 'custom-reports', name: 'Custom Reports', icon: FileText },
        { id: 'data-export', name: 'Data Export/Import', icon: Download }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
        
      case 'academic':
        return (
          <AcademicManagementDashboard 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'student-management':
        return <StudentManagement />;
        
      case 'batch-management':
        return (
          <BatchManagement 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'financial':
        return (
          <FinancialManagementDashboard 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'transport':
        return (
          <TransportManagementDashboard 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'employee':
        return (
          <EmployeeManagementDashboard 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'admissions':
        return (
          <AdmissionsManagementDashboard 
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        );
        
      case 'school-management':
        return <SchoolManagement />;
        
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h2>
              <p className="text-gray-600">Generate comprehensive reports and analytics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <BookMarked className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Reports</h3>
                <p className="text-gray-600 text-sm">Performance, attendance, and exam reports</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <DollarSign className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Reports</h3>
                <p className="text-gray-600 text-sm">Fee collection, payroll, and budget reports</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <Bus className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Operational Reports</h3>
                <p className="text-gray-600 text-sm">Transport, maintenance, and safety reports</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <Database className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Reports</h3>
                <p className="text-gray-600 text-sm">System usage and performance reports</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <FileText className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
                <p className="text-gray-600 text-sm">Create and manage custom report templates</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <Download className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Export/Import</h3>
                <p className="text-gray-600 text-sm">Export and import data in various formats</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to School Management System</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${navigationExpanded ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            {navigationExpanded && (
              <span className="font-semibold text-gray-900">School Management</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Three-line menu for expand/collapse */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNavigationExpanded(!navigationExpanded)}
              className="w-8 h-8 p-0"
              title={navigationExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 p-0 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <nav className="mt-4 px-4">
          {/* Expand/Collapse All Button */}
          {navigationExpanded && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSections}
                className="w-full justify-center text-xs"
              >
                {expandedSections.size === navigationSections.length ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>
          )}
          
          {navigationSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            const isActive = activeSection === section.id;
            
            return (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  title={!navigationExpanded ? section.name : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SectionIcon className="h-5 w-5 flex-shrink-0" />
                  {navigationExpanded && (
                    <>
                      <span className="font-medium flex-1">{section.name}</span>
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
                
                {isExpanded && navigationExpanded && (
                  <div className="mt-2 ml-8 space-y-1">
                    {section.subSections.map((subSection) => {
                      const SubSectionIcon = subSection.icon;
                      return (
                        <button
                          key={subSection.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setActiveSubSection(subSection.id);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeSubSection === subSection.id && isActive
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <SubSectionIcon className="h-4 w-4" />
                          <span className="text-sm">{subSection.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Main Header */}
        <div className="bg-white px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {navigationSections.find(s => s.id === activeSection)?.icon && 
                    React.createElement(navigationSections.find(s => s.id === activeSection)!.icon, {
                      className: "h-6 w-6 text-indigo-600"
                    })
                  }
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigationSections.find(s => s.id === activeSection)?.name || 'Dashboard'}
                  </h1>
                </div>
                <p className="text-gray-600">
                  {navigationSections.find(s => s.id === activeSection)?.subSections.find(sub => sub.id === activeSubSection)?.name || 'Overview'}
                </p>
              </div>
            </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/home')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
          </div>
    </div>
  );
}
