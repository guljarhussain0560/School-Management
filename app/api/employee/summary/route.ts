import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Calculate summary statistics efficiently
    const [totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees, totalSalary] = await Promise.all([
      prisma.employee.count({
        where: { schoolId: session.user.schoolId }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'ACTIVE' }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'INACTIVE' }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'ON_LEAVE' }
      }),
      prisma.employee.aggregate({
        where: { schoolId: session.user.schoolId, status: 'ACTIVE' },
        _sum: { salary: true }
      })
    ])

    const summary = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      totalSalary: Number(totalSalary._sum.salary || 0)
    }

    return NextResponse.json({ summary })

  } catch (error) {
    console.error('Get employee summary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
