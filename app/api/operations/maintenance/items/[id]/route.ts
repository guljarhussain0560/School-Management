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

    const item = await prisma.maintenanceItem.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Maintenance item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ item })

  } catch (error) {
    console.error('Error fetching maintenance item:', error)
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
    const { name, description, status, notes, photoUrl } = body

    // Check if item exists and belongs to school
    const existingItem = await prisma.maintenanceItem.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Maintenance item not found' },
        { status: 404 }
      )
    }

    // Update maintenance item
    const updatedItem = await prisma.maintenanceItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(photoUrl !== undefined && { photoUrl }),
        lastChecked: new Date()
      }
    })

    return NextResponse.json({
      message: 'Maintenance item updated successfully',
      item: updatedItem
    })

  } catch (error) {
    console.error('Error updating maintenance item:', error)
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

    // Check if item exists and belongs to school
    const existingItem = await prisma.maintenanceItem.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Maintenance item not found' },
        { status: 404 }
      )
    }

    // Delete maintenance item
    await prisma.maintenanceItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Maintenance item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting maintenance item:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
