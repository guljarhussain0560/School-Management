'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { CurriculumOverviewCards } from './curriculum/CurriculumOverviewCards'
import { CurriculumListTable } from './curriculum/CurriculumListTable'
import { CurriculumItem, CurriculumSummary } from './curriculum/types'

export default function CurriculumManagement() {
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
  const [summary, setSummary] = useState<CurriculumSummary>({
    totalModules: 0,
    averageProgress: 0,
    completedModules: 0,
    inProgressModules: 0,
    notStartedModules: 0,
  })
  const [loading, setLoading] = useState(false)

  const fetchCurriculum = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/academic/curriculum')
      if (res.ok) {
        const data = await res.json()
        const items: CurriculumItem[] = data.curriculum || (Array.isArray(data) ? data : [])
        setCurriculum(items)

        const total = items.length
        const completed = items.filter(i => i.progress === 100).length
        const inProgress = items.filter(i => i.progress > 0 && i.progress < 100).length
        const notStarted = items.filter(i => i.progress === 0).length
        const avg = total > 0 ? Math.round(items.reduce((acc, curr) => acc + curr.progress, 0) / total) : 0

        setSummary({
          totalModules: total,
          averageProgress: avg,
          completedModules: completed,
          inProgressModules: inProgress,
          notStartedModules: notStarted,
        })
      }
    } catch {
      toast.error('Failed to load curriculum data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurriculum()
  }, [fetchCurriculum])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Curriculum & Syllabus Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Track syllabus completion milestones, grade-wise modules, and pedagogical pacing.
          </p>
        </div>
      </div>

      <CurriculumOverviewCards summary={summary} />

      <CurriculumListTable
        items={curriculum}
        isLoading={loading}
        onRefresh={fetchCurriculum}
        onAddModule={() => toast.info('New module dialog')}
      />
    </div>
  )
}
