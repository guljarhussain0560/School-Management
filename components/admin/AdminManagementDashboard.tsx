'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Menu, X, BookMarked, DollarSign, Bus,
  Database, FileText, Download,
} from 'lucide-react'

import { navigationSections } from './adminNavigationConfig'
import AcademicManagementDashboard from './AcademicManagementDashboard'
import FinancialManagementDashboard from './FinancialManagementDashboard'
import AdmissionsManagementDashboard from './AdmissionsManagementDashboard'
import TransportManagementDashboard from './TransportManagementDashboard'
import EmployeeManagementDashboard from './EmployeeManagementDashboard'
import BatchManagementDashboard from './BatchManagementDashboard'
import DashboardOverview from '../dashboard/DashboardOverview'
import StudentManagement from '../student/StudentManagement'
import SchoolManagement from '../school/SchoolManagement'
import BatchManagement from '../academic/BatchManagement'
import UserManagement from './UserManagement'
import UsersDashboard from './UsersDashboard'
import ProfileManagement from './ProfileManagement'
import AccountSettings from './AccountSettings'
import SecuritySettings from './SecuritySettings'
import SystemSettings from './SystemSettings'

export default function AdminManagementDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navigationExpanded, setNavigationExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard']))
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSubSection, setActiveSubSection] = useState('overview')

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections)
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId)
    } else {
      newExpandedSections.add(sectionId)
    }
    setExpandedSections(newExpandedSections)

    if (newExpandedSections.has(sectionId)) {
      setActiveSection(sectionId)
      const section = navigationSections.find((s) => s.id === sectionId)
      if (section && section.subSections.length > 0) {
        setActiveSubSection(section.subSections[0].id)
      }
    }
  }

  const toggleAllSections = () => {
    if (expandedSections.size === navigationSections.length) {
      setExpandedSections(new Set())
    } else {
      setExpandedSections(new Set(navigationSections.map((s) => s.id)))
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'academic':
        return (
          <AcademicManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'student-management':
        return <StudentManagement />
      case 'batch-management':
        return (
          <BatchManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'employee':
        return (
          <EmployeeManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'user-management':
        if (activeSubSection === 'users-dashboard') {
          return <UsersDashboard />
        }
        return <UserManagement />
      case 'account-settings':
        switch (activeSubSection) {
          case 'profile':
            return <ProfileManagement />
          case 'account-settings':
            return <AccountSettings />
          case 'security':
            return <SecuritySettings />
          case 'system-settings':
            return <SystemSettings />
          default:
            return <ProfileManagement />
        }
      case 'financial':
        return (
          <FinancialManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'transport':
        return (
          <TransportManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'admissions':
        return (
          <AdmissionsManagementDashboard
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
          />
        )
      case 'school-management':
        return <SchoolManagement />
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
        )
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to School Management System</h2>
              <p className="text-gray-600">Select a section from the sidebar to get started</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${navigationExpanded ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            {navigationExpanded && (
              <span className="font-semibold text-gray-900">School Management</span>
            )}
          </div>
          <div className="flex items-center gap-1">
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

        <nav className="flex-1 overflow-y-auto px-4 py-4">
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
            const SectionIcon = section.icon
            const isExpanded = expandedSections.has(section.id)
            const isActive = activeSection === section.id

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
                      const SubSectionIcon = subSection.icon
                      return (
                        <button
                          key={subSection.id}
                          onClick={() => {
                            setActiveSection(section.id)
                            setActiveSubSection(subSection.id)
                            setSidebarOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
                            activeSubSection === subSection.id && activeSection === section.id
                              ? 'bg-indigo-100 text-indigo-800 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <SubSectionIcon className="h-4 w-4" />
                          <span>{subSection.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-gray-900">School Management</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
