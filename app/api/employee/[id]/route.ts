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
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const employeeId = params.id

    // Find employee by ID or employeeId
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeId },
          { employeeId: employeeId }
        ],
        schoolId: session.user.schoolId
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        position: true,
        salary: true,
        status: true,
        dateOfJoining: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      employee
    })

  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const employeeId = params.id
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ACTIVE, INACTIVE, TERMINATED, ON_LEAVE' },
        { status: 400 }
      )
    }

    // Find employee by ID or employeeId
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeId },
          { employeeId: employeeId }
        ],
        schoolId: session.user.schoolId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Update employee status
    const updatedEmployee = await prisma.employee.update({
      where: { id: existingEmployee.id },
      data: { status },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        position: true,
        salary: true,
        status: true,
        dateOfJoining: true
      }
    })

    return NextResponse.json({
      message: 'Employee status updated successfully',
      employee: updatedEmployee
    })

  } catch (error) {
    console.error('Update employee status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}