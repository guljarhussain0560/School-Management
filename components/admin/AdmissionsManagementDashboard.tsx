'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, List, UploadCloud, FileSpreadsheet } from 'lucide-react'
import { useAdmissions } from './admissions/hooks/useAdmissions'
import { AdmissionsOverviewCards } from './admissions/AdmissionsOverviewCards'
import { AdmissionsListTable } from './admissions/AdmissionsListTable'
import { StudentAdmissionDialog } from './admissions/StudentAdmissionDialog'
import { BasicInfoSection } from './admissions/sections/BasicInfoSection'
import { PersonalInfoSection } from './admissions/sections/PersonalInfoSection'
import { ContactSection } from './admissions/sections/ContactSection'
import { AcademicSection } from './admissions/sections/AcademicSection'
import { DocumentsSection } from './admissions/sections/DocumentsSection'

interface AdmissionsManagementDashboardProps {
  activeSubSection: string
  setActiveSubSection: (section: string) => void
}

export default function AdmissionsManagementDashboard({
  activeSubSection,
  setActiveSubSection,
}: AdmissionsManagementDashboardProps) {
  const {
    loading,
    studentForm,
    handleFormChange,
    activeFormSection,
    setActiveFormSection,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    selectedStudent,
    setSelectedStudent,
    isDialogOpen,
    setIsDialogOpen,
    students,
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    selectedGrade,
    setSelectedGrade,
    isLoadingAdmissions,
    admissionStats,
    fetchAdmissions,
    handleStudentSubmit,
  } = useAdmissions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Student Admissions & Enrollment
          </h1>
          <p className="text-sm text-muted-foreground">
            Process student registrations, manage applicant portfolios, and verify document onboarding.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <AdmissionsOverviewCards stats={admissionStats} totalCount={totalCount} />

      {/* Tabs navigation */}
      <Tabs value={activeSubSection || 'admissions-list'} onValueChange={setActiveSubSection} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full max-w-xl mb-6">
          <TabsTrigger value="admissions-list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Admissions Roster
          </TabsTrigger>
          <TabsTrigger value="new-admission" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Admission
          </TabsTrigger>
          <TabsTrigger value="excel-upload" className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Admissions Roster */}
        <TabsContent value="admissions-list">
          <AdmissionsListTable
            students={students}
            isLoading={isLoadingAdmissions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            searchTerm={searchTerm}
            searchField={searchField}
            statusFilter={statusFilter}
            selectedGrade={selectedGrade}
            onSearchChange={setSearchTerm}
            onFieldChange={setSearchField}
            onStatusChange={setStatusFilter}
            onGradeChange={setSelectedGrade}
            onPageChange={setCurrentPage}
            onRefresh={fetchAdmissions}
            onViewStudent={student => {
              setSelectedStudent(student)
              setIsDialogOpen(true)
            }}
          />
        </TabsContent>

        {/* Tab 2: New Admission Form */}
        <TabsContent value="new-admission">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Student Registration Application</CardTitle>
              <CardDescription>
                Enter applicant details across personal, guardian, academic, and document verification sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStudentSubmit} className="space-y-6">
                <div className="flex gap-2 border-b pb-3 overflow-x-auto text-sm font-medium">
                  {(['basic', 'personal', 'contact', 'academic', 'documents'] as const).map(sec => (
                    <Button
                      key={sec}
                      type="button"
                      variant={activeFormSection === sec ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveFormSection(sec)}
                      className="capitalize"
                    >
                      {sec} Info
                    </Button>
                  ))}
                </div>

                {activeFormSection === 'basic' && (
                  <BasicInfoSection formData={studentForm} onChange={handleFormChange} />
                )}
                {activeFormSection === 'personal' && (
                  <PersonalInfoSection formData={studentForm} onChange={handleFormChange} />
                )}
                {activeFormSection === 'contact' && (
                  <ContactSection formData={studentForm} onChange={handleFormChange} />
                )}
                {activeFormSection === 'academic' && (
                  <AcademicSection formData={studentForm} onChange={handleFormChange} />
                )}
                {activeFormSection === 'documents' && (
                  <DocumentsSection formData={studentForm} onChange={handleFormChange} />
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting Application...' : 'Register Student'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Bulk Import */}
        <TabsContent value="excel-upload">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Batch Excel Student Import
              </CardTitle>
              <CardDescription>
                Upload a structured spreadsheet (.xlsx, .csv) with student profiles for bulk enrollment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">Drag & drop your Excel file here, or browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports XLSX, XLS, CSV files up to 10MB</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Student Modal */}
      <StudentAdmissionDialog
        student={selectedStudent}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedStudent(null)
        }}
      />
    </div>
  )
}
