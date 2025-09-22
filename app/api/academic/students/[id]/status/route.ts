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
    if (!session || !session.user?.schoolId || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status } = await request.json()
    
    // Map frontend status values to database enum values
    const statusMap: { [key: string]: string } = {
      'Pending': 'PENDING',
      'Under Review': 'UNDER_REVIEW', 
      'Accepted': 'ACCEPTED',
      'Approved': 'ACCEPTED',
      'Rejected': 'REJECTED'
    }
    
    const dbStatus = statusMap[status] || status
    
    if (!dbStatus || !['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].includes(dbStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Pending, Under Review, Accepted, or Rejected' },
        { status: 400 }
      )
    }

    // Update student status
    const updatedStudent = await prisma.student.update({
      where: { 
        id: params.id,
        schoolId: session.user.schoolId // Ensure student belongs to admin's school
      },
      data: { 
        status: dbStatus as any,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        busRoute: {
          select: { routeName: true, id: true }
        },
        class: {
          select: { className: true, classCode: true }
        }
      }
    })

    if (!updatedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Student status updated successfully',
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        grade: updatedStudent.class?.className || 'Unknown',
        status: updatedStudent.status,
        updatedAt: updatedStudent.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating student status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
