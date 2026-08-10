import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IDService } from '@/lib/id-service'
import { createBusSchema } from '@/lib/validation/operations'
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
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit
    const schoolId = session.user.schoolId || 'default-school'

    // Build where clause
    const where: any = {
      schoolId,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { busNumber: { contains: search, mode: 'insensitive' } },
        { busName: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [buses, totalCount] = await Promise.all([
      prisma.bus.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          routes: {
            select: { id: true, routeName: true, status: true },
          },
        },
      }),
      prisma.bus.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      buses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    logger.error('Error fetching buses', error, { path: '/api/operations/buses' })
    return apiError('Failed to fetch buses', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401)
    }

    const body = await request.json()
    const validationResult = createBusSchema.safeParse(body)

    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.issues)
    }

    const {
      route,
      capacity,
      busName,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      status,
    } = validationResult.data

    const schoolId = session.user.schoolId || 'default-school'

    // Initialize ID service with school configuration
    await IDService.initializeSchool(schoolId)

    // Parse route number
    const routeNum = parseInt(route) || 1
    const busCapSize: 'LARGE' | 'MEDIUM' | 'SMALL' = capacity >= 50 ? 'LARGE' : capacity >= 30 ? 'MEDIUM' : 'SMALL'

    // Generate unique bus number
    const busNumber = await IDService.generateBusNumber(routeNum, busCapSize, schoolId)

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        busName: busName || null,
        capacity,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        conductorName: conductorName || null,
        conductorPhone: conductorPhone || null,
        status,
        schoolId,
      },
      include: {
        routes: {
          select: { id: true, routeName: true, status: true },
        },
      },
    })

    logger.info('Bus created successfully', {
      busNumber: bus.busNumber,
      schoolId,
    })

    return NextResponse.json({
      message: 'Bus created successfully',
      bus,
    })
  } catch (error) {
    logger.error('Error creating bus', error, { path: '/api/operations/buses' })
    return apiError('Failed to create bus', 500)
  }
}
