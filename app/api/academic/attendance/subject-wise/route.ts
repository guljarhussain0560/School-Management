import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { date, grade, subject, attendanceRecords } = body

    // Validate required fields
    if (!date || !grade || !subject || !attendanceRecords) {
      return NextResponse.json(
        { error: 'Date, grade, subject, and attendance records are required' },
        { status: 400 }
      )
    }

    // Validate student IDs exist
    const studentIds = attendanceRecords.map((record: any) => record.studentId)
    const existingStudents = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        grade: grade,
        schoolId: session.user.schoolId!
      },
      select: { id: true }
    })

    const existingStudentIds = existingStudents.map(s => s.id)
    const invalidStudentIds = studentIds.filter((id: string) => !existingStudentIds.includes(id))
    
    if (invalidStudentIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid student IDs: ${invalidStudentIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Create attendance records
    const attendanceData = attendanceRecords.map((record: any) => ({
      studentId: record.studentId,
      date: new Date(date),
      isPresent: record.status === 'PRESENT',
      schoolId: session.user.schoolId,
      markedBy: session.user.id
    }))

    // Use upsert to handle existing records
    const results = []
    for (const record of attendanceData) {
      try {
        const result = await prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: record.date
            }
          },
          update: {
            isPresent: record.isPresent,
            markedBy: record.markedBy
          },
          create: record
        })
        results.push(result)
      } catch (recordError) {
        console.error('Error upserting attendance record:', record, recordError)
        throw recordError
      }
    }

    return NextResponse.json({
      message: 'Subject-wise attendance recorded successfully',
      count: results.length
    })

  } catch (error) {
    console.error('Error recording subject-wise attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const date = searchParams.get('date')
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (date) {
      where.date = new Date(date)
    }

    if (grade) {
      where.student = {
        grade: grade
      }
    }

    if (search) {
      where.student = {
        ...where.student,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
          { rollNumber: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Get attendance records with pagination
    const [attendanceRecords, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              rollNumber: true,
              grade: true
            }
          },
          marker: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.attendance.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      attendanceRecords,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching subject-wise attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
