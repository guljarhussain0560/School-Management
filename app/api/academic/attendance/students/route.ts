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
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade is required' },
        { status: 400 }
      )
    }

    // Get students for the specified grade
    const students = await prisma.student.findMany({
      where: {
        grade: grade,
        schoolId: session.user.schoolId!,
        status: 'ACCEPTED' // Only get accepted students
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        rollNumber: true,
        grade: true
      },
      orderBy: {
        rollNumber: 'asc'
      }
    })

    return NextResponse.json({
      students
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}