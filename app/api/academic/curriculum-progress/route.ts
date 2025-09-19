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

    const progress = await prisma.curriculumProgress.findMany({
      where,
      include: {
        updater: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { subject: 'asc' },
        { grade: 'asc' },
        { module: 'asc' }
      ]
    })

    return NextResponse.json({
      progress
    })
  } catch (error) {
    console.error('Error fetching curriculum progress:', error)
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

    const body = await request.json()
    const { subject, grade, module, progress } = body

    // Validate required fields
    if (!subject || !grade || !module || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate progress value
    const progressValue = parseFloat(progress)
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Upsert curriculum progress
    const curriculumProgress = await prisma.curriculumProgress.upsert({
      where: {
        subject_grade_module_schoolId: {
          subject,
          grade,
          module,
          schoolId: session.user.schoolId!
        }
      },
      update: {
        progress: progressValue,
        updatedBy: session.user.id
      },
      create: {
        subject,
        grade,
        module,
        progress: progressValue,
        schoolId: session.user.schoolId!,
        updatedBy: session.user.id
      },
      include: {
        updater: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      progress: curriculumProgress,
      message: 'Curriculum progress updated successfully'
    })
  } catch (error) {
    console.error('Error updating curriculum progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, progress } = body

    if (!id || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate progress value
    const progressValue = parseFloat(progress)
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if progress record exists and belongs to the school
    const existingProgress = await prisma.curriculumProgress.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Curriculum progress not found' },
        { status: 404 }
      )
    }

    const updatedProgress = await prisma.curriculumProgress.update({
      where: {
        id
      },
      data: {
        progress: progressValue,
        updatedBy: session.user.id
      },
      include: {
        updater: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      progress: updatedProgress,
      message: 'Curriculum progress updated successfully'
    })
  } catch (error) {
    console.error('Error updating curriculum progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
