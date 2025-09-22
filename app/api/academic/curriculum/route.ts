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
    const { subject, grade, module, progress } = body

    // Validate required fields
    if (!subject || !grade || !module || progress === undefined) {
      return NextResponse.json(
        { error: 'Subject, grade, module, and progress are required' },
        { status: 400 }
      )
    }

    // Validate progress is between 0 and 100
    const progressNum = parseFloat(progress)
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
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

    // Create or update curriculum progress
    const curriculum = await prisma.curriculumProgress.upsert({
      where: {
        subjectId_classId_module: {
          subjectId: subjectRecord.id,
          classId: classRecord.id,
          module
        }
      },
      update: {
        progress: progressNum,
        updatedBy: session.user.id
      },
      create: {
        subjectId: subjectRecord.id,
        classId: classRecord.id,
        module,
        progress: progressNum,
        schoolId: session.user.schoolId ?? '',
        updatedBy: session.user.id
      },
      include: {
        updater: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Curriculum progress updated successfully',
      curriculum
    })

  } catch (error) {
    console.error('Error updating curriculum progress:', error)
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

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (search) {
      where.OR = [
        { module: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (grade) {
      where.grade = grade
    }

    if (subject) {
      where.subject = subject
    }

    // Get curriculum progress with pagination
    const [curriculum, total] = await Promise.all([
      prisma.curriculumProgress.findMany({
        where,
        include: {
          updater: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.curriculumProgress.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      curriculum,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching curriculum progress:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
