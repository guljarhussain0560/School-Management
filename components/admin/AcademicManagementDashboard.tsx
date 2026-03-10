'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, Calendar, FileText, Settings, 
  Users, CheckCircle, GraduationCap, Award
} from 'lucide-react'

// Subcomponents & Sections
import CurriculumManagement from '@/components/academic/CurriculumManagement'
import AttendanceManagement from '@/components/academic/AttendanceManagement'
import AcademicManagement from '@/components/academic/AcademicManagement'
import ExamManagement from '@/components/academic/ExamManagement'
import AcademicCalendar from '@/components/academic/AcademicCalendar'
import StudentPerformanceSection from '@/components/academic/sections/StudentPerformanceSection'

interface AcademicManagementDashboardProps {
  activeSubSection: string
  setActiveSubSection: (section: string) => void
}

export default function AcademicManagementDashboard({
  activeSubSection,
  setActiveSubSection,
}: AcademicManagementDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academic Operations & Curriculum Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Oversee classroom batches, student attendance registers, institutional curriculum, and exam schedules.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeSubSection || 'academics'}
        onValueChange={setActiveSubSection}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full mb-6">
          <TabsTrigger value="academics" className="flex items-center gap-2 text-xs md:text-sm">
            <BookOpen className="h-4 w-4" />
            Classes & Batches
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2 text-xs md:text-sm">
            <CheckCircle className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2 text-xs md:text-sm">
            <FileText className="h-4 w-4" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2 text-xs md:text-sm">
            <Settings className="h-4 w-4" />
            Exams & Grading
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 text-xs md:text-sm">
            <Award className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 text-xs md:text-sm">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academics">
          <AcademicManagement />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceManagement />
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumManagement />
        </TabsContent>

        <TabsContent value="exams">
          <ExamManagement />
        </TabsContent>

        <TabsContent value="performance">
          <StudentPerformanceSection />
        </TabsContent>

        <TabsContent value="calendar">
          <AcademicCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
