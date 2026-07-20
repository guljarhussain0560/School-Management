'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, UserCheck, FileSpreadsheet, List } from 'lucide-react'
import { toast } from 'sonner'
import { GradeAttendanceSection, StudentAttendanceItem } from './attendance/GradeAttendanceSection'

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState('grade-wise')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<StudentAttendanceItem[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const fetchStudents = useCallback(async (grade: string) => {
    if (!grade) return
    setLoading(true)
    try {
      const res = await fetch(`/api/academic/students?grade=${encodeURIComponent(grade)}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.students || []
        setStudents(items)
        // Default all to present
        const initialMap: Record<string, boolean> = {}
        items.forEach((s: StudentAttendanceItem) => {
          initialMap[s.id] = true
        })
        setAttendanceData(initialMap)
      }
    } catch {
      toast.error('Failed to load grade roster')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    fetchStudents(grade)
  }

  const handleToggleStatus = (studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: isPresent }))
  }

  const handleMarkAll = (isPresent: boolean) => {
    const updated: Record<string, boolean> = {}
    students.forEach(s => {
      updated[s.id] = isPresent
    })
    setAttendanceData(updated)
  }

  const handleSubmitAttendance = async () => {
    if (students.length === 0) return
    setLoading(true)
    try {
      const payload = {
        date: selectedDate,
        grade: selectedGrade,
        records: students.map(s => ({
          studentId: s.id,
          isPresent: attendanceData[s.id] !== false,
        })),
      }

      const res = await fetch('/api/academic/attendance/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Attendance recorded successfully')
      } else {
        toast.error('Failed to submit attendance')
      }
    } catch {
      toast.error('Network error during attendance submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Student Attendance Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Record daily classroom roll calls, batch attendance logs, and track absence trends.
          </p>
        </div>
      </div>

      <GradeAttendanceSection
        students={students}
        selectedGrade={selectedGrade}
        selectedDate={selectedDate}
        attendanceData={attendanceData}
        loading={loading}
        onGradeChange={handleGradeChange}
        onDateChange={setSelectedDate}
        onToggleStatus={handleToggleStatus}
        onMarkAll={handleMarkAll}
        onSubmit={handleSubmitAttendance}
      />
    </div>
  )
}
