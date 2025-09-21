import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

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
    const studentId = searchParams.get('studentId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
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

    if (studentId) {
      where.studentId = studentId
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { examType: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
        {
          student: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    const [performances, total] = await Promise.all([
      prisma.studentPerformance.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              grade: true,
              rollNumber: true
            }
          },
          creator: {
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
      prisma.studentPerformance.count({ where })
    ])

    // Get unique subjects for dropdown
    const subjects = await prisma.studentPerformance.findMany({
      where: { schoolId: session.user.schoolId },
      select: { subject: true },
      distinct: ['subject'],
      orderBy: { subject: 'asc' }
    })

    return NextResponse.json({
      performances,
      subjects: subjects.map(s => s.subject),
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

    const contentType = request.headers.get('content-type')
    
    // Handle file upload (bulk upload)
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Read and parse the file
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      const results = []
      const errors = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any
        // Support multiple column name formats
        const studentId = row['Student ID'] || row['studentId'] || row['StudentID'] || row['Student_Id'] || row['student_id']
        const subject = row['Subject'] || row['subject'] || row['Subject_Name'] || row['subject_name']
        const grade = row['Grade'] || row['grade'] || row['Class'] || row['class'] || row['Grade_Level'] || row['grade_level']
        const marks = row['Marks'] || row['marks'] || row['Marks_Obtained'] || row['marks_obtained'] || row['Score'] || row['score']
        const maxMarks = row['Max Marks'] || row['maxMarks'] || row['MaxMarks'] || row['Max_Marks'] || row['max_marks'] || row['Total_Marks'] || row['total_marks'] || 100
        const examType = row['Exam Type'] || row['examType'] || row['ExamType'] || row['Exam_Type'] || row['exam_type'] || row['Type'] || row['type'] || 'Quiz'
        const examDate = row['Exam Date'] || row['examDate'] || row['ExamDate'] || row['Exam_Date'] || row['exam_date'] || row['Date'] || row['date']
        const remarks = row['Remarks'] || row['remarks'] || row['Comments'] || row['comments'] || row['Note'] || row['note']

        // Validate required fields
        if (!studentId || !subject || !grade || !marks) {
          errors.push(`Row ${i + 2}: Missing required fields (Student ID, Subject, Grade, Marks)`)
          continue
        }

        // Validate exam type
        const validExamTypes = ['Quiz', 'Test', 'Exam', 'Assignment', 'Project', 'Practical']
        if (examType && !validExamTypes.includes(examType)) {
          errors.push(`Row ${i + 2}: Invalid exam type '${examType}'. Must be one of: ${validExamTypes.join(', ')}`)
          continue
        }

        // Find student by ID, studentId, roll number, or admission number
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { id: studentId },
              { studentId: studentId },
              { rollNumber: studentId },
              { admissionNumber: studentId }
            ],
            schoolId: session.user.schoolId!
          }
        })

        if (!student) {
          errors.push(`Row ${i + 2}: Student not found for ID: ${studentId}`)
          continue
        }

        try {
          const performance = await prisma.studentPerformance.create({
            data: {
              studentId: student.id,
              subject,
              grade,
              marks: parseFloat(marks),
              maxMarks: parseFloat(maxMarks),
              examType,
              examDate: examDate ? new Date(examDate) : null,
              remarks,
              schoolId: session.user.schoolId!,
              createdBy: session.user.id
            }
          })
          results.push(performance)
        } catch (error) {
          errors.push(`Row ${i + 2}: Error creating performance record - ${error}`)
        }
      }

      return NextResponse.json({
        message: `Successfully processed ${results.length} records`,
        successCount: results.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      })
    }

    // Handle single record creation
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
        OR: [
          { id: studentId },
          { studentId: studentId },
          { rollNumber: studentId },
          { admissionNumber: studentId }
        ],
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
            studentId: true,
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
