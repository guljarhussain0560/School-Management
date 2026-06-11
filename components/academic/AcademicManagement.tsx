'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Calendar, GraduationCap, CalendarDays } from 'lucide-react'
import { BatchesSection, StudentBatch } from './sections/BatchesSection'
import { ClassesSection, ClassItem } from './sections/ClassesSection'
import { SubjectsSection, SubjectItem } from './sections/SubjectsSection'

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState('classes')
  const [batches, setBatches] = useState<StudentBatch[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch('/api/academic/student-batches')
      if (res.ok) {
        const data = await res.json()
        setBatches(data.batches || [])
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/academic/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes || [])
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/academic/subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
      }
    } catch {
      // quiet fallback
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchBatches(), fetchClasses(), fetchSubjects()])
    setIsLoading(false)
  }, [fetchBatches, fetchClasses, fetchSubjects])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Academic Roster & Coursework
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage academic batches, classroom section rosters, and subject curriculum allocations.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <ClassesSection classes={classes} isLoading={isLoading} onRefresh={fetchClasses} />
        </TabsContent>

        <TabsContent value="batches">
          <BatchesSection batches={batches} isLoading={isLoading} onRefresh={fetchBatches} />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectsSection subjects={subjects} isLoading={isLoading} onRefresh={fetchSubjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
