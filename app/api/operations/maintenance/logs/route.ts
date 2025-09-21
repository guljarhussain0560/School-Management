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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const facility = searchParams.get('facility')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (facility && facility !== 'all') {
      where.facility = facility
    }

    if (search) {
      where.OR = [
        { facility: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get maintenance logs with pagination
    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.maintenanceLog.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching maintenance logs:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const { facility, status, notes, proofUrl } = body

    // Validate required fields
    if (!facility || !status) {
      return NextResponse.json(
        { error: 'Facility and status are required' },
        { status: 400 }
      )
    }

    // Create maintenance log
    const log = await prisma.maintenanceLog.create({
      data: {
        facility,
        status,
        notes: notes || null,
        proofUrl: proofUrl || null,
        reportedBy: session.user.id,
        schoolId: session.user.schoolId
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Maintenance log created successfully',
      log
    })

  } catch (error) {
    console.error('Error creating maintenance log:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
