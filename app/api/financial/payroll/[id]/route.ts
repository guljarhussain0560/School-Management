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

    const payrollId = params.id
    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'APPROVED', 'PAID'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, APPROVED, or PAID' },
        { status: 400 }
      )
    }

    // Find the payroll record
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        id: payrollId,
        schoolId: session.user.schoolId
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true
          }
        }
      }
    })

    if (!existingPayroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Update the payroll status
    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true
          }
        }
      }
    })

    // If status changed to PAID, generate receipt data
    let receiptData = null
    if (status === 'PAID' && existingPayroll.status !== 'PAID') {
      receiptData = {
        receiptNumber: `PAY-${payrollId.slice(-8).toUpperCase()}`,
        employeeName: updatedPayroll.employeeName,
        employeeId: updatedPayroll.employee?.employeeId || 'N/A',
        department: updatedPayroll.department,
        position: updatedPayroll.position,
        basicSalary: Number(updatedPayroll.basicSalary),
        allowances: Number(updatedPayroll.allowances),
        deductions: Number(updatedPayroll.deductions),
        netSalary: Number(updatedPayroll.amount),
        month: updatedPayroll.month,
        year: updatedPayroll.year,
        paymentDate: new Date().toISOString(),
        status: updatedPayroll.status
      }
    }

    return NextResponse.json({
      message: 'Payroll status updated successfully',
      payroll: updatedPayroll,
      receiptData
    })

  } catch (error) {
    console.error('Update payroll status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
