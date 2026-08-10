import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid due date'),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
})

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
    const parsed = createAssignmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { title, grade, subject, dueDate, description } = parsed.data

    const dueDateObj = new Date(dueDate)
    if (dueDateObj <= new Date()) {
      return NextResponse.json(
        { error: 'Due date must be in the future' },
        { status: 400 }
      )
    }

    // Find subject and class
    const subjectRecord = await prisma.subject.findFirst({
      where: {
        subjectName: {
          contains: subject,
          mode: 'insensitive'
        },
        schoolId: session.user.schoolId!
      }
    })

    const classRecord = await prisma.class.findFirst({
      where: {
        OR: [
          { classCode: { contains: grade, mode: 'insensitive' } },
          { grade: { gradeName: { contains: grade, mode: 'insensitive' } } }
        ],
        schoolId: session.user.schoolId!
      }
    })

    if (!subjectRecord) {
      return NextResponse.json(
        { error: `Subject '${subject}' not found` },
        { status: 400 }
      )
    }

    if (!classRecord) {
      return NextResponse.json(
        { error: `Class '${grade}' not found` },
        { status: 400 }
      )
    }

    // Generate assignment ID
    const assignmentId = `ASG${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    const assignment = await prisma.assignment.create({
      data: {
        assignmentId,
        title,
        subjectId: subjectRecord.id,
        classId: classRecord.id,
        dueDate: dueDateObj,
        description: description || null,
        schoolId: session.user.schoolId ?? '', 
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment
    })

  } catch (error) {
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
    const search = searchParams.get('search') || ''
    const grade = searchParams.get('grade') || ''
    const subject = searchParams.get('subject') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {
      schoolId: session.user.schoolId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (grade) {
      where.class = {
        OR: [
          { classCode: { contains: grade, mode: 'insensitive' } },
          { grade: { gradeName: { contains: grade, mode: 'insensitive' } } }
        ]
      }
    }

    if (subject) {
      where.subject = {
        subjectName: {
          contains: subject,
          mode: 'insensitive'
        }
      }
    }

    if (status) {
      where.status = status
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          creator: {
            select: { name: true }
          },
          students: {
            include: {
              student: {
                select: { name: true, studentId: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.assignment.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}