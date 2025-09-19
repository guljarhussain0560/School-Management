import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'TRANSPORT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Transport access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status, delayReason, delayMinutes } = body

    // Validation
    if (!status || !['ON_TIME', 'DELAYED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

    // Check if bus route exists and belongs to same school
    const busRoute = await prisma.busRoute.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId!
      }
    })

    if (!busRoute) {
      return NextResponse.json(
        { error: 'Bus route not found' },
        { status: 404 }
      )
    }

    // Update bus route status
    const updatedBusRoute = await prisma.busRoute.update({
      where: { id },
      data: {
        status,
        delayReason: status === 'DELAYED' ? delayReason : null,
        delayMinutes: status === 'DELAYED' ? delayMinutes : null,
      }
    })

    return NextResponse.json({
      message: 'Bus route status updated successfully',
      busRoute: updatedBusRoute
    })

  } catch (error) {
    console.error('Update bus route status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
