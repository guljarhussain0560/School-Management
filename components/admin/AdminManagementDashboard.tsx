'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, DollarSign, UserPlus, Building, 
  BarChart3, Calendar, FileText, BookOpen, 
  Users, Settings, AlertCircle, Menu, X, Briefcase
} from 'lucide-react';

// Import the new components
import AcademicManagementDashboard from './AcademicManagementDashboard';
import FinancialManagementDashboard from './FinancialManagementDashboard';
import AdmissionsManagementDashboard from './AdmissionsManagementDashboard';
import TransportManagementDashboard from './TransportManagementDashboard';
import EmployeeManagementDashboard from './EmployeeManagementDashboard';

export default function AdminManagementDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('academic');
  const [activeSubSection, setActiveSubSection] = useState('performance');

  // Navigation structure
  const navigationSections = [
    {
      id: 'academic',
      name: 'Academic',
      icon: GraduationCap,
      subSections: [
        { id: 'performance', name: 'Performance', icon: BarChart3 },
        { id: 'attendance', name: 'Attendance', icon: Calendar },
        { id: 'assignments', name: 'Assignments', icon: FileText },
        { id: 'curriculum', name: 'Curriculum', icon: BookOpen }
      ]
    },
    {
      id: 'financial',
      name: 'Financial',
      icon: DollarSign,
      subSections: [
        { id: 'fee-collection', name: 'Fee Collection', icon: DollarSign },
        { id: 'payroll', name: 'Payroll', icon: Users },
        { id: 'budget', name: 'Budget', icon: Building }
      ]
    },
    {
      id: 'admissions',
      name: 'Admissions',
      icon: UserPlus,
      subSections: [
        { id: 'student-onboarding', name: 'Student Onboarding', icon: UserPlus },
        { id: 'batch-upload', name: 'Batch Upload', icon: FileText },
        { id: 'recent-admissions', name: 'Recent Admissions', icon: GraduationCap }
      ]
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: Building,
      subSections: [
        { id: 'operations-transport', name: 'Operations & Transport', icon: Building },
        { id: 'maintenance-log', name: 'Maintenance Log', icon: Settings },
        { id: 'safety-alerts', name: 'Safety Alerts', icon: AlertCircle }
      ]
    },
    {
      id: 'employee',
      name: 'Employee',
      icon: Briefcase,
      subSections: [
        { id: 'employee-management', name: 'Employee Management', icon: Users }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'academic':
        return (
          <AcademicManagementDashboard 
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
      case 'admissions':
        return (
          <AdmissionsManagementDashboard 
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
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="font-semibold text-gray-900">School Management</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 p-0 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="mt-4 px-4">
          {navigationSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    setActiveSubSection(section.subSections[0].id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SectionIcon className="h-5 w-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
                
                {activeSection === section.id && (
                  <div className="mt-2 ml-8 space-y-1">
                    {section.subSections.map((subSection) => {
                      const SubSectionIcon = subSection.icon;
                      return (
                        <button
                          key={subSection.id}
                          onClick={() => setActiveSubSection(subSection.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeSubSection === subSection.id
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
      <div className="flex-1 flex flex-col">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">School Management Portal</h1>
                  <p className="text-gray-600">Data input interface for academic, financial, and operational management</p>
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
