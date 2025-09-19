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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

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

    const [performances, total] = await Promise.all([
      prisma.studentPerformance.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              grade: true,
              rollNumber: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.studentPerformance.count({ where })
    ])

    return NextResponse.json({
      performances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching student performances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentId, subject, grade, marks, maxMarks, examType, examDate, remarks } = body

    // Validate required fields
    if (!studentId || !subject || !grade || !marks || !maxMarks) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student exists and belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: session.user.schoolId!
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const performance = await prisma.studentPerformance.create({
      data: {
        studentId,
        subject,
        grade,
        marks: parseFloat(marks),
        maxMarks: parseFloat(maxMarks),
        examType: examType || 'Quiz',
        examDate: examDate ? new Date(examDate) : null,
        remarks,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            rollNumber: true
          }
        }
      }
    })

    return NextResponse.json({
      performance,
      message: 'Student performance recorded successfully'
    })
  } catch (error) {
    console.error('Error creating student performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
