import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED, or CANCELLED' },
        { status: 400 }
      )
    }

    // Update budget expense status
    const updatedExpense = await prisma.budgetExpense.update({
      where: { id: params.id },
      data: { status },
      include: {
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Budget expense status updated successfully',
      expense: updatedExpense
    })

  } catch (error) {
    console.error('Update budget expense status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get budget expense details
    const expense = await prisma.budgetExpense.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Budget expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expense })

  } catch (error) {
    console.error('Get budget expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
