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
    const { title, grade, subject, dueDate, description, fileUrl } = body

    console.log('Assignment data received:', { title, grade, subject, dueDate, description, fileUrl })

    // Validate required fields
    if (!title || !grade || !subject || !dueDate) {
      return NextResponse.json(
        { error: 'Title, grade, subject, and due date are required' },
        { status: 400 }
      )
    }

    // Validate due date is in the future
    const dueDateObj = new Date(dueDate)
    if (dueDateObj <= new Date()) {
      return NextResponse.json(
        { error: 'Due date must be in the future' },
        { status: 400 }
      )
    }

    // Create assignment
    // Find subject and class
    const subjectRecord = await prisma.subject.findFirst({
      where: {
        subjectName: {
          contains: subject,
          mode: 'insensitive'
        },
        schoolId: session.user.schoolId!
      }
    });

    const classRecord = await prisma.class.findFirst({
      where: {
        className: {
          contains: `Class ${grade}`,
          mode: 'insensitive'
        },
        schoolId: session.user.schoolId!
      }
    });

    if (!subjectRecord) {
      return NextResponse.json(
        { error: `Subject '${subject}' not found` },
        { status: 400 }
      );
    }

    if (!classRecord) {
      return NextResponse.json(
        { error: `Class '${grade}' not found` },
        { status: 400 }
      );
    }

    // Generate assignment ID
    const assignmentId = `ASG${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

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
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment
    })

  } catch (error) {
    console.error('Error creating assignment:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const grade = searchParams.get('grade') || ''
    const subject = searchParams.get('subject') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
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
        className: {
          contains: grade,
          mode: 'insensitive'
        }
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

    // Get assignments with pagination
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          creator: {
            select: {
              name: true
            }
          },
          students: {
            include: {
              student: {
                select: {
                  name: true,
                  studentId: true
                }
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
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}