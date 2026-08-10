import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IDService } from '@/lib/id-service'
import { createClassSchema } from '@/lib/validation/academic'
import { logger } from '@/lib/logger'
import { apiError } from '@/lib/api-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const batchId = searchParams.get('batchId')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit
    const schoolId = session.user.schoolId || 'default-school'

    // Build where clause
    const where: any = {
      schoolId,
    }

    if (batchId && batchId !== 'all') {
      where.batchId = batchId
    }

    if (search) {
      where.OR = [
        { classCode: { contains: search, mode: 'insensitive' } },
        { sectionName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [classes, totalCount] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: { classCode: 'asc' },
        include: {
          batch: {
            select: { id: true, batchName: true, academicYear: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { students: true, subjects: true },
          },
        },
      }),
      prisma.class.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    logger.error('Error fetching classes', error, { path: '/api/academic/classes' })
    return apiError('Failed to fetch classes', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const validationResult = createClassSchema.safeParse(body)

    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.issues)
    }

    const {
      level,
      section,
      description,
      capacity,
      batchId,
    } = validationResult.data

    const schoolId = session.user.schoolId || 'default-school'

    // Get batch information
    const batch = await prisma.studentBatch.findUnique({
      where: { id: batchId },
      select: { id: true, batchCode: true },
    })

    if (!batch) {
      return apiError('Invalid batch ID', 400)
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(schoolId)

    // Generate unique class code
    const classCode = await IDService.generateClassCode(batch.batchCode, level, section, schoolId)

    // Ensure grade exists or find matching grade
    let grade = await prisma.grade.findFirst({
      where: {
        batchId,
        schoolId,
      },
    })

    if (!grade) {
      grade = await prisma.grade.create({
        data: {
          gradeCode: `G${level}`,
          gradeName: `Grade ${level}`,
          gradeLevel: parseInt(level) || 1,
          batchId,
          schoolId,
          createdBy: session.user.id,
        },
      })
    }

    // Check if class already exists in the same batch
    const existingClass = await prisma.class.findFirst({
      where: {
        classCode,
        schoolId,
      },
    })

    if (existingClass) {
      return apiError('Class already exists in this batch', 400)
    }

    const newClass = await prisma.class.create({
      data: {
        classCode,
        sectionName: section,
        description: description || null,
        capacity,
        gradeId: grade.id,
        batchId,
        schoolId,
        createdBy: session.user.id,
      },
      include: {
        batch: {
          select: { id: true, batchName: true, academicYear: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    logger.info('Class created successfully', {
      classCode: newClass.classCode,
      schoolId,
    })

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass,
    })
  } catch (error) {
    logger.error('Error creating class', error, { path: '/api/academic/classes' })
    return apiError('Failed to create class', 500)
  }
}
