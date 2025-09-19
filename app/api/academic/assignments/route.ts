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
    const status = searchParams.get('status')

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

    if (status && ['PENDING', 'COMPLETED', 'OVERDUE'].includes(status)) {
      where.status = status
    }

    // Get assignments
    const assignments = await prisma.assignment.findMany({
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
                name: true
              }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json({ assignments })

  } catch (error) {
    console.error('Get assignments error:', error)
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
    const { title, subject, grade, dueDate, description } = body

    // Validation
    if (!title || !subject || !grade || !dueDate) {
      return NextResponse.json(
        { error: 'Title, subject, grade, and due date are required' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        subject,
        grade,
        dueDate: new Date(dueDate),
        description,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id,
      }
    })

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment
    }, { status: 201 })

  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
