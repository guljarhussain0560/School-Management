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
    const date = searchParams.get('date')
    const grade = searchParams.get('grade')
    const studentId = searchParams.get('studentId')

    // Build where clause
    const where: any = {
      student: {
        schoolId: session.user.schoolId
      }
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    if (grade) {
      where.student = {
        ...where.student,
        grade
      }
    }

    if (studentId) {
      where.studentId = studentId
    }

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        marker: {
          select: {
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ attendance })

  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, date, isPresent } = body

    // Validation
    if (!studentId || !date) {
      return NextResponse.json(
        { error: 'Student ID and date are required' },
        { status: 400 }
      )
    }

    // Check if student belongs to same school
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

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date)
        }
      },
      update: {
        isPresent: Boolean(isPresent),
        markedBy: session.user.id
      },
      create: {
        studentId,
        date: new Date(date),
        isPresent: Boolean(isPresent),
        markedBy: session.user.id,
        schoolId: session.user.schoolId!
      }
    })

    return NextResponse.json({
      message: 'Attendance recorded successfully',
      attendance
    }, { status: 201 })

  } catch (error) {
    console.error('Record attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
