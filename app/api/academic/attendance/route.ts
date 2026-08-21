import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recordAttendanceSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Teacher access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = recordAttendanceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid attendance payload', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { date, attendanceRecords } = validation.data

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

    // Create attendance records
    const attendanceData = attendanceRecords.map((record: any) => ({
      studentId: record.studentId,
      classId: studentClassMap.get(record.studentId) || '',
      date: new Date(date),
      isPresent: record.status === 'PRESENT',
      schoolId: session.user.schoolId || "",
      markedBy: session.user.id
    }))

    let createdAttendance
    try {
      createdAttendance = await prisma.attendance.createMany({
        data: attendanceData
      })
    } catch (createError) {
      logger.error('Error creating attendance records bulk', createError as Error)
      const results = []
      for (const record of attendanceData) {
        try {
          const result = await prisma.attendance.create({
            data: record
          })
          results.push(result)
        } catch (recordError) {
          logger.error('Error creating individual record', recordError as Error, { record: String(record.studentId) })
          throw recordError
        }
      }
      createdAttendance = { count: results.length }
    }

    return NextResponse.json({
      message: 'Attendance recorded successfully',
      count: createdAttendance.count
    })

  } catch (error) {
    logger.error('Error recording attendance', error as Error, { path: '/api/academic/attendance' })
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
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (date) {
      where.date = new Date(date)
    }

    if (classId) {
      where.classId = classId
    }

    if (status) {
      where.isPresent = status === 'PRESENT'
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

    return NextResponse.json({
      attendanceRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get attendance error', error as Error, { path: '/api/academic/attendance' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}