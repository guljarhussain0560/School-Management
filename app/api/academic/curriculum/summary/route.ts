import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade') || ''
    const subject = searchParams.get('subject') || ''

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (grade) {
      where.grade = grade
    }

    if (subject) {
      where.subject = subject
    }

    // Get curriculum progress data
    const curriculumData = await prisma.curriculumProgress.findMany({
      where,
      select: {
        module: true,
        progress: true,
        updatedAt: true,
        subject: {
          select: {
            subjectName: true
          }
        },
        class: {
          select: {
            className: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Calculate summary statistics
    const summary = {
      totalModules: curriculumData.length,
      averageProgress: 0,
      completedModules: 0,
      inProgressModules: 0,
      notStartedModules: 0,
      byGrade: {} as Record<string, any>,
      bySubject: {} as Record<string, any>,
      recentUpdates: curriculumData.slice(0, 10)
    }

    if (curriculumData.length > 0) {
      // Calculate overall statistics
      const totalProgress = curriculumData.reduce((sum, item) => sum + item.progress, 0)
      summary.averageProgress = Math.round((totalProgress / curriculumData.length) * 100) / 100
      
      summary.completedModules = curriculumData.filter(item => item.progress === 100).length
      summary.inProgressModules = curriculumData.filter(item => item.progress > 0 && item.progress < 100).length
      summary.notStartedModules = curriculumData.filter(item => item.progress === 0).length

      // Group by grade
      curriculumData.forEach(item => {
        const gradeName = item.class.className;
        if (!summary.byGrade[gradeName]) {
          summary.byGrade[gradeName] = {
            totalModules: 0,
            averageProgress: 0,
            completedModules: 0,
            inProgressModules: 0,
            notStartedModules: 0
          }
        }
        
        const gradeData = summary.byGrade[gradeName]
        gradeData.totalModules++
        gradeData.averageProgress += item.progress
        
        if (item.progress === 100) gradeData.completedModules++
        else if (item.progress > 0) gradeData.inProgressModules++
        else gradeData.notStartedModules++
      })

      // Calculate average progress for each grade
      Object.keys(summary.byGrade).forEach(grade => {
        const gradeData = summary.byGrade[grade]
        gradeData.averageProgress = Math.round((gradeData.averageProgress / gradeData.totalModules) * 100) / 100
      })

      // Group by subject
      curriculumData.forEach(item => {
        const subjectName = item.subject.subjectName;
        if (!summary.bySubject[subjectName]) {
          summary.bySubject[subjectName] = {
            totalModules: 0,
            averageProgress: 0,
            completedModules: 0,
            inProgressModules: 0,
            notStartedModules: 0
          }
        }
        
        const subjectData = summary.bySubject[subjectName]
        subjectData.totalModules++
        subjectData.averageProgress += item.progress
        
        if (item.progress === 100) subjectData.completedModules++
        else if (item.progress > 0) subjectData.inProgressModules++
        else subjectData.notStartedModules++
      })

      // Calculate average progress for each subject
      Object.keys(summary.bySubject).forEach(subject => {
        const subjectData = summary.bySubject[subject]
        subjectData.averageProgress = Math.round((subjectData.averageProgress / subjectData.totalModules) * 100) / 100
      })
    }

    return NextResponse.json({
      summary
    })

  } catch (error) {
    console.error('Error fetching curriculum summary:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
