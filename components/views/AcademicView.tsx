'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Calendar, BookOpen, Users, UserCheck } from 'lucide-react'
import TeacherAssignments from '@/components/admin/TeacherAssignments'
import { useAcademicView } from './hooks/useAcademicView'
import { PerformanceSection } from './sections/PerformanceSection'
import { AttendanceSection } from './sections/AttendanceSection'
import { AssignmentSection } from './sections/AssignmentSection'
import { CurriculumSection } from './sections/CurriculumSection'

export default function AcademicView() {
  const {
    activeTab,
    setActiveTab,
    loading,
    students,
    assignments,
    curriculumProgress,
    showPerformanceForm,
    setShowPerformanceForm,
    showAttendanceForm,
    setShowAttendanceForm,
    showAssignmentForm,
    setShowAssignmentForm,
    showCurriculumForm,
    setShowCurriculumForm,
    performanceForm,
    setPerformanceForm,
    attendanceForm,
    setAttendanceForm,
    assignmentForm,
    setAssignmentForm,
    curriculumForm,
    setCurriculumForm,
    handlePerformanceSubmit,
    handleAttendanceSubmit,
    handleAssignmentSubmit,
    handleCurriculumSubmit,
    toggleStudentAttendance,
    setAllAttendance,
  } = useAcademicView()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
        <p className="text-muted-foreground">
          Oversee student performance, attendance rosters, assignments, and curriculum progress.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="teacher-assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Teachers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceSection
            students={students}
            showForm={showPerformanceForm}
            setShowForm={setShowPerformanceForm}
            form={performanceForm}
            setForm={setPerformanceForm}
            onSubmit={handlePerformanceSubmit}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceSection
            showForm={showAttendanceForm}
            setShowForm={setShowAttendanceForm}
            form={attendanceForm}
            setForm={setAttendanceForm}
            onSubmit={handleAttendanceSubmit}
            toggleAttendance={toggleStudentAttendance}
            setAllAttendance={setAllAttendance}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <AssignmentSection
            assignments={assignments}
            showForm={showAssignmentForm}
            setShowForm={setShowAssignmentForm}
            form={assignmentForm}
            setForm={setAssignmentForm}
            onSubmit={handleAssignmentSubmit}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <CurriculumSection
            curriculumProgress={curriculumProgress}
            showForm={showCurriculumForm}
            setShowForm={setShowCurriculumForm}
            form={curriculumForm}
            setForm={setCurriculumForm}
            onSubmit={handleCurriculumSubmit}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="teacher-assignments" className="space-y-4">
          <TeacherAssignments />
        </TabsContent>
      </Tabs>
    </div>
  )
}