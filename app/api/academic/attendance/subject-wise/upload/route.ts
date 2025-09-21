import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const grade = formData.get('grade') as string
    const subject = formData.get('subject') as string
    const date = formData.get('date') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!grade || !subject || !date) {
      return NextResponse.json(
        { error: 'Grade, subject, and date are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the Excel file' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: 0,
      total: data.length,
      errorDetails: [] as string[]
    }

    // Get all students for the grade
    const students = await prisma.student.findMany({
      where: {
        grade: grade,
        schoolId: session.user.schoolId!
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        rollNumber: true
      }
    })

    const studentMap = new Map(students.map(s => [s.studentId, s]))

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      
      try {
        // Validate required fields
        const studentId = row.studentId || row['Student ID'] || row['StudentID']
        const status = row.status || row.Status || row.present || row.Present

        if (!studentId || status === undefined) {
          results.errors++
          results.errorDetails.push(`Row ${i + 2}: Missing required fields (studentId, status)`)
          continue
        }

        const student = studentMap.get(String(studentId))
        if (!student) {
          results.errors++
          results.errorDetails.push(`Row ${i + 2}: Student with ID ${studentId} not found in grade ${grade}`)
          continue
        }

        const isPresent = String(status).toLowerCase() === 'present' || status === true || status === 1

        // Upsert attendance record
        await prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: student.id,
              date: new Date(date)
            }
          },
          update: {
            isPresent: isPresent,
            markedBy: session.user.id
          },
          create: {
            studentId: student.id,
            date: new Date(date),
            isPresent: isPresent,
            schoolId: session.user.schoolId!,
            markedBy: session.user.id
          }
        })

        results.success++
      } catch (error) {
        results.errors++
        results.errorDetails.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: 'Subject-wise attendance Excel upload completed',
      results
    })

  } catch (error) {
    console.error('Error processing subject-wise attendance Excel upload:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
