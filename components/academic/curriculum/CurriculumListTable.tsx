'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, RefreshCw, Plus } from 'lucide-react'
import { CurriculumItem } from './types'

interface CurriculumListTableProps {
  items: CurriculumItem[]
  isLoading: boolean
  onRefresh: () => void
  onAddModule: () => void
}

export function CurriculumListTable({ items, isLoading, onRefresh, onAddModule }: CurriculumListTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Curriculum Modules & Lesson Plans
          </CardTitle>
          <CardDescription>Syllabus modules, completion percentages, and teaching milestones</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={onAddModule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Module / Topic</th>
                <th className="px-4 py-3 w-48">Syllabus Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">No curriculum modules recorded.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.subject}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.grade}</Badge></td>
                    <td className="px-4 py-3">{item.module}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={item.progress} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-8 text-right">{item.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
