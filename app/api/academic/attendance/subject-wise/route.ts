import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Teacher access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { subject, grade, date, attendanceRecords } = body

    // Validation
    if (!subject || !grade || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Subject, grade, date, and attendance records are required' },
        { status: 400 }
      )
    }

    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        { error: 'At least one attendance record is required' },
        { status: 400 }
      )
    }

    // Verify all students belong to the school
    const studentIds = attendanceRecords.map((r: any) => r.studentId)
    const existingStudents = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId: session.user.schoolId!
      },
      select: { id: true, classId: true }
    })

    const existingStudentIds = existingStudents.map(s => s.id)
    const studentClassMap = new Map(existingStudents.map(s => [s.id, s.classId]))
    const invalidStudentIds = studentIds.filter((id: string) => !existingStudentIds.includes(id))
    
    if (invalidStudentIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid student IDs: ${invalidStudentIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Get class information for the grade
    const classRecord = await prisma.class.findFirst({
      where: {
        classCode: { contains: `Class ${grade}`, mode: 'insensitive' },
        schoolId: session.user.schoolId!
      }
    })

    // Create attendance records
    const attendanceData = attendanceRecords.map((record: any) => ({
      studentId: record.studentId,
      classId: studentClassMap.get(record.studentId) || classRecord?.id || '',
      date: new Date(date),
      isPresent: record.status === 'PRESENT',
      schoolId: session.user.schoolId || "",
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
        logger.error('Error upserting attendance record', recordError as Error, { record: String(record.studentId) })
        throw recordError
      }
    }

    return NextResponse.json({
      message: 'Subject-wise attendance recorded successfully',
      count: results.length
    })

  } catch (error) {
    logger.error('Error recording subject-wise attendance', error as Error, { path: '/api/academic/attendance/subject-wise' })
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
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: any = {
      schoolId: session.user.schoolId
    }

    if (date) {
      where.date = new Date(date)
    }

    if (grade) {
      where.student = {
        class: {
          classCode: { contains: grade, mode: 'insensitive' }
        }
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
              class: {
                select: {
                  classCode: true,
                  sectionName: true
                }
              }
            }
          },
          marker: {
            select: {
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.attendance.count({ where })
    ])

    const presentCount = await prisma.attendance.count({
      where: { ...where, isPresent: true }
    })
    const absentCount = total - presentCount
    const attendancePercentage = total > 0 ? (presentCount / total) * 100 : 0

    return NextResponse.json({
      attendanceRecords,
      summary: {
        total,
        present: presentCount,
        absent: absentCount,
        percentage: Math.round(attendancePercentage * 100) / 100
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get subject-wise attendance error', error as Error, { path: '/api/academic/attendance/subject-wise' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
