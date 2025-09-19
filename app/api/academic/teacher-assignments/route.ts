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
    const teacherId = searchParams.get('teacherId')

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    // If teacherId is provided, filter by teacher
    if (teacherId) {
      where.teacherId = teacherId
    }

    // If user is a teacher, only show their assignments
    if (session.user.role === 'TEACHER') {
      where.teacherId = session.user.id
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      assignments
    })
  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
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

    // Only admin can create teacher assignments
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { teacherId, subject, grade } = body

    // Validate required fields
    if (!teacherId || !subject || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if teacher exists and belongs to the school
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        schoolId: session.user.schoolId!,
        role: 'TEACHER'
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacherId,
        subject,
        grade,
        schoolId: session.user.schoolId!
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment already exists for this teacher, subject, and grade' },
        { status: 409 }
      )
    }

    const assignment = await prisma.teacherAssignment.create({
      data: {
        teacherId,
        subject,
        grade,
        schoolId: session.user.schoolId!
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      assignment,
      message: 'Teacher assignment created successfully'
    })
  } catch (error) {
    console.error('Error creating teacher assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admin can delete teacher assignments
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Check if assignment exists and belongs to the school
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        id: assignmentId,
        schoolId: session.user.schoolId!
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    await prisma.teacherAssignment.delete({
      where: {
        id: assignmentId
      }
    })

    return NextResponse.json({
      message: 'Teacher assignment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting teacher assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
