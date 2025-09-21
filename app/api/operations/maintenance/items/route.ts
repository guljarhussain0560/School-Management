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
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get maintenance items with pagination
    const [items, total] = await Promise.all([
      prisma.maintenanceItem.findMany({
        where,
        orderBy: {
          lastChecked: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.maintenanceItem.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching maintenance items:', error)
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
    const { name, description, status, notes, photoUrl } = body

    // Validate required fields
    if (!name || !status) {
      return NextResponse.json(
        { error: 'Name and status are required' },
        { status: 400 }
      )
    }

    // Create maintenance item
    const item = await prisma.maintenanceItem.create({
      data: {
        name,
        description: description || null,
        status,
        notes: notes || null,
        photoUrl: photoUrl || null,
        lastChecked: new Date(),
        schoolId: session.user.schoolId!
      }
    })

    return NextResponse.json({
      message: 'Maintenance item created successfully',
      item
    })

  } catch (error) {
    console.error('Error creating maintenance item:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
