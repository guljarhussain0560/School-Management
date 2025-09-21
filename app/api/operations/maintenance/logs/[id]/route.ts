import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const log = await prisma.maintenanceLog.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
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

    if (!log) {
      return NextResponse.json(
        { error: 'Maintenance log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ log })

  } catch (error) {
    console.error('Error fetching maintenance log:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if log exists and belongs to school
    const existingLog = await prisma.maintenanceLog.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Maintenance log not found' },
        { status: 404 }
      )
    }

    // Update maintenance log
    const updatedLog = await prisma.maintenanceLog.update({
      where: { id: params.id },
      data: {
        ...(facility && { facility }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(proofUrl !== undefined && { proofUrl })
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
      message: 'Maintenance log updated successfully',
      log: updatedLog
    })

  } catch (error) {
    console.error('Error updating maintenance log:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if log exists and belongs to school
    const existingLog = await prisma.maintenanceLog.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Maintenance log not found' },
        { status: 404 }
      )
    }

    // Delete maintenance log
    await prisma.maintenanceLog.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Maintenance log deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting maintenance log:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
