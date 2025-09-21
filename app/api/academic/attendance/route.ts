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

    console.log('Attendance data received:', { date, grade, subject, attendanceRecords })

    // Validate required fields
    if (!date || !grade || !subject || !attendanceRecords) {
      return NextResponse.json(
        { error: 'Date, grade, subject, and attendance records are required' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this date (simplified check)
    try {
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          date: new Date(date),
          schoolId: session.user.schoolId!!
        }
      })

      if (existingAttendance) {
        return NextResponse.json(
          { error: 'Attendance already recorded for this date' },
          { status: 400 }
        )
      }
    } catch (checkError) {
      console.log('Could not check existing attendance, proceeding with creation:', checkError instanceof Error ? checkError.message : 'Unknown error')
    }

    // Validate student IDs exist
    const studentIds = attendanceRecords.map((record: any) => record.studentId)
    const existingStudents = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
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
      isPresent: record.status === 'PRESENT', // Convert to boolean
      schoolId: session.user.schoolId,
      markedBy: session.user.id
    }))

    console.log('Attendance data to create:', attendanceData)
    console.log('Session user:', { id: session.user.id, schoolId: session.user.schoolId })

    let createdAttendance
    try {
      createdAttendance = await prisma.attendance.createMany({
        data: attendanceData
      })
    } catch (createError) {
      console.error('Error creating attendance records:', createError)
      // Try creating records one by one to identify which one fails
      const results = []
      for (const record of attendanceData) {
        try {
          const result = await prisma.attendance.create({
            data: record
          })
          results.push(result)
        } catch (recordError) {
          console.error('Error creating individual record:', record, recordError)
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
    console.error('Error recording attendance:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      meta: (error as any).meta
    })
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
    const date = searchParams.get('date')
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (date) {
      where.date = new Date(date)
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            rollNumber: true
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
      }
    })

    return NextResponse.json({
      attendanceRecords
    })

  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}