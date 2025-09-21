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

    // Get unique grades from students
    const grades = await prisma.student.findMany({
      where: { 
        schoolId: session.user.schoolId!,
        status: 'ACCEPTED' // Only get grades from accepted students
      },
      select: { grade: true },
      distinct: ['grade'],
      orderBy: { grade: 'asc' }
    })

    // Also get unique grades from performance records
    const performanceGrades = await prisma.studentPerformance.findMany({
      where: { schoolId: session.user.schoolId! },
      select: { grade: true },
      distinct: ['grade'],
      orderBy: { grade: 'asc' }
    })

    // Combine and deduplicate grades
    const allGrades = [...grades, ...performanceGrades]
      .map(item => item.grade)
      .filter((grade, index, self) => self.indexOf(grade) === index)
      .sort()

    return NextResponse.json({
      grades: allGrades
    })

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
